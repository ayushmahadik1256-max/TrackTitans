import { query, withTransaction } from '../config/db.js';
import { calculateSha256 } from '../utils/checksum.js';
import { uploadFdrFile, getPresignedDownloadUrl } from './s3Service.js';
import { sendAndLogNotification } from './notificationService.js';
import logger from '../utils/logger.js';

/**
 * Register a new FDR record with private S3 upload and audit history
 */
export async function createFdr({ user, fdrData, file }) {
  if (!file) {
    const error = new Error('FDR document PDF file is required');
    error.statusCode = 400;
    throw error;
  }

  // Look up institution for this user
  const instRes = await query('SELECT id, institution_name, contact_email FROM institutions WHERE user_id = $1 LIMIT 1', [user.id]);
  let institution = instRes.rows[0];

  if (!institution) {
    // If not existing, create a default institution profile for this institution user
    const createInstSql = `
      INSERT INTO institutions (user_id, aicte_application_id, institution_name, contact_email)
      VALUES ($1, $2, $3, $4)
      RETURNING id, institution_name, contact_email;
    `;
    const newInst = await query(createInstSql, [
      user.id,
      `AICTE-${Date.now().toString().slice(-8)}`,
      user.institution_name || 'Affiliated Institution',
      user.email,
    ]);
    institution = newInst.rows[0];
  }

  // Look up bank if existing bank matches bank_name
  let bankId = null;
  if (fdrData.bank_name) {
    const bankRes = await query(
      'SELECT id FROM banks WHERE LOWER(bank_name) = LOWER($1) LIMIT 1',
      [fdrData.bank_name.trim()]
    );
    if (bankRes.rows.length > 0) {
      bankId = bankRes.rows[0].id;
    }
  }

  // 1. Calculate SHA-256 checksum
  const checksum = calculateSha256(file.buffer);

  // 2. Upload to private S3 storage
  const { s3BucketName, s3ObjectKey } = await uploadFdrFile({
    buffer: file.buffer,
    originalFileName: file.originalname,
    institutionId: institution.id,
    mimeType: file.mimetype,
  });

  return withTransaction(async (client) => {
    // 3. Insert FDR record
    const insertFdrSql = `
      INSERT INTO fdr_records (
        institution_id, bank_id, fdr_number, deposit_amount, issue_date, maturity_date,
        lien_marked, status, s3_bucket_name, s3_object_key, original_file_name,
        file_size_bytes, file_checksum_sha256, remarks
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *;
    `;

    const fdrRes = await client.query(insertFdrSql, [
      institution.id,
      bankId,
      fdrData.fdr_number.trim(),
      fdrData.deposit_amount,
      fdrData.issue_date,
      fdrData.maturity_date,
      false, // Lien initially unverified until bank marks it
      'submitted',
      s3BucketName,
      s3ObjectKey,
      file.originalname,
      file.size,
      checksum,
      fdrData.remarks || null,
    ]);

    const fdr = fdrRes.rows[0];

    // 4. Record status history
    const historySql = `
      INSERT INTO fdr_status_history (
        fdr_record_id, changed_by_user_id, previous_status, new_status, notes
      )
      VALUES ($1, $2, NULL, 'submitted', $3);
    `;
    await client.query(historySql, [
      fdr.id,
      user.id,
      `Initial submission by ${institution.institution_name}. PDF document uploaded: ${file.originalname}`,
    ]);

    logger.info('New FDR registered', { fdrId: fdr.id, fdrNumber: fdr.fdr_number, institutionId: institution.id });
    return fdr;
  });
}

/**
 * Retrieve list of FDRs scoped strictly by user role
 */
export async function getFdrs({ user, queryParams = {} }) {
  const { status, search, limit = 50, offset = 0 } = queryParams;

  let baseSql = `
    SELECT 
      f.id, f.institution_id, f.bank_id, f.fdr_number, f.deposit_amount, f.issue_date, f.maturity_date,
      f.lien_marked, f.status, f.original_file_name, f.file_size_bytes, f.file_checksum_sha256,
      f.remarks, f.created_at, f.updated_at,
      i.institution_name, i.aicte_application_id, i.contact_email as institution_email,
      COALESCE(b.bank_name, 'Unassigned Bank') as bank_name,
      b.branch_name, b.ifsc_code,
      (f.maturity_date - CURRENT_DATE) as days_to_maturity
    FROM fdr_records f
    INNER JOIN institutions i ON f.institution_id = i.id
    LEFT JOIN banks b ON f.bank_id = b.id
    WHERE 1=1
  `;

  const values = [];
  let paramIdx = 1;

  // 1. Role-based scoping
  if (user.role === 'institution') {
    // Get institution ID
    const instRes = await query('SELECT id FROM institutions WHERE user_id = $1 LIMIT 1', [user.id]);
    const instId = instRes.rows[0]?.id;
    if (!instId) {
      return { total: 0, records: [] };
    }
    baseSql += ` AND f.institution_id = $${paramIdx++}`;
    values.push(instId);
  } else if (user.role === 'bank') {
    // Bank user sees FDRs assigned to their bank or matching bank name
    const bankRes = await query('SELECT id, bank_name FROM banks WHERE user_id = $1 LIMIT 1', [user.id]);
    const bankId = bankRes.rows[0]?.id;
    const bankName = bankRes.rows[0]?.bank_name || user.bank_name;

    if (bankId) {
      baseSql += ` AND (f.bank_id = $${paramIdx} OR LOWER(b.bank_name) = LOWER($${paramIdx + 1}))`;
      values.push(bankId, bankName || '');
      paramIdx += 2;
    } else if (bankName) {
      baseSql += ` AND LOWER(b.bank_name) = LOWER($${paramIdx++})`;
      values.push(bankName);
    }
  } else if (user.role === 'aicte_admin') {
    // AICTE admin has full system visibility
  }

  // 2. Status filter
  if (status && status !== 'all') {
    baseSql += ` AND f.status = $${paramIdx++}`;
    values.push(status);
  }

  // 3. Search query
  if (search && search.trim() !== '') {
    baseSql += ` AND (f.fdr_number ILIKE $${paramIdx} OR i.institution_name ILIKE $${paramIdx} OR i.aicte_application_id ILIKE $${paramIdx})`;
    values.push(`%${search.trim()}%`);
    paramIdx++;
  }

  baseSql += ` ORDER BY f.created_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
  values.push(parseInt(limit, 10), parseInt(offset, 10));

  const result = await query(baseSql, values);
  return {
    total: result.rowCount,
    records: result.rows,
  };
}

/**
 * Retrieve single FDR record by ID with history and verify role access
 */
export async function getFdrById({ id, user }) {
  const fdrSql = `
    SELECT 
      f.id, f.institution_id, f.bank_id, f.fdr_number, f.deposit_amount, f.issue_date, f.maturity_date,
      f.lien_marked, f.status, f.original_file_name, f.file_size_bytes, f.file_checksum_sha256,
      f.remarks, f.created_at, f.updated_at, f.s3_object_key,
      i.institution_name, i.aicte_application_id, i.contact_email as institution_email, i.contact_phone,
      i.address as institution_address, i.state as institution_state,
      b.bank_name, b.branch_name, b.ifsc_code,
      (f.maturity_date - CURRENT_DATE) as days_to_maturity
    FROM fdr_records f
    INNER JOIN institutions i ON f.institution_id = i.id
    LEFT JOIN banks b ON f.bank_id = b.id
    WHERE f.id = $1
    LIMIT 1;
  `;
  const fdrRes = await query(fdrSql, [id]);

  if (fdrRes.rows.length === 0) {
    const error = new Error('FDR record not found');
    error.statusCode = 404;
    throw error;
  }

  const fdr = fdrRes.rows[0];

  // Access check
  if (user.role === 'institution') {
    const instRes = await query('SELECT id FROM institutions WHERE user_id = $1 LIMIT 1', [user.id]);
    if (fdr.institution_id !== instRes.rows[0]?.id) {
      const err = new Error('Access forbidden to this FDR record');
      err.statusCode = 403;
      throw err;
    }
  }

  // Fetch status history audit log
  const historySql = `
    SELECT h.id, h.previous_status, h.new_status, h.notes, h.created_at,
           u.full_name as changed_by_name, u.role as changed_by_role
    FROM fdr_status_history h
    LEFT JOIN users u ON h.changed_by_user_id = u.id
    WHERE h.fdr_record_id = $1
    ORDER BY h.created_at ASC;
  `;
  const historyRes = await query(historySql, [id]);

  return {
    ...fdr,
    history: historyRes.rows,
  };
}

/**
 * Generate a temporary pre-signed URL for FDR PDF download
 */
export async function getFdrDocumentDownloadUrl({ id, user }) {
  const fdr = await getFdrById({ id, user });
  const presignedUrl = await getPresignedDownloadUrl(fdr.s3_object_key);
  return {
    downloadUrl: presignedUrl,
    fdrNumber: fdr.fdr_number,
    fileName: fdr.original_file_name,
    checksum: fdr.file_checksum_sha256,
  };
}

/**
 * Bank verification action
 */
export async function verifyFdrByBank({ id, bankUser, status, lien_marked, notes }) {
  const fdr = await getFdrById({ id, user: bankUser });

  return withTransaction(async (client) => {
    // Get or link bank ID
    const bankRes = await client.query('SELECT id FROM banks WHERE user_id = $1 LIMIT 1', [bankUser.id]);
    const bankId = bankRes.rows[0]?.id || fdr.bank_id;

    const newStatus = status; // 'bank_verified' or 'rejected'

    const updateSql = `
      UPDATE fdr_records
      SET bank_id = COALESCE($1, bank_id),
          status = $2,
          lien_marked = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *;
    `;
    const updatedRes = await client.query(updateSql, [bankId, newStatus, lien_marked, id]);
    const updatedFdr = updatedRes.rows[0];

    // Record history
    const historySql = `
      INSERT INTO fdr_status_history (
        fdr_record_id, changed_by_user_id, previous_status, new_status, notes
      )
      VALUES ($1, $2, $3, $4, $5);
    `;
    await client.query(historySql, [
      id,
      bankUser.id,
      fdr.status,
      newStatus,
      notes || `Status marked as ${newStatus}. Lien marked: ${lien_marked ? 'YES' : 'NO'}.`,
    ]);

    // Send email alert to institution
    await sendAndLogNotification({
      fdrRecordId: id,
      recipientEmail: fdr.institution_email,
      notificationType: `bank_${newStatus}`,
      subject: `Bank Verification Update for FDR ${fdr.fdr_number}: ${newStatus.toUpperCase()}`,
      body: `<p>Your FDR <strong>${fdr.fdr_number}</strong> was reviewed by ${bankUser.bank_name || 'Bank'}.</p>
             <p><strong>Result:</strong> ${newStatus}</p>
             <p><strong>Lien Marked in favour of AICTE:</strong> ${lien_marked ? 'Confirmed' : 'Not Marked'}</p>
             <p><strong>Notes:</strong> ${notes || 'No notes specified'}</p>`,
    });

    return updatedFdr;
  });
}

/**
 * Institution requests release/refund of security deposit
 */
export async function requestFdrRelease({ id, institutionUser, notes }) {
  const fdr = await getFdrById({ id, user: institutionUser });

  if (['release_requested', 'release_approved'].includes(fdr.status)) {
    const error = new Error(`Release has already been ${fdr.status.replace('_', ' ')}.`);
    error.statusCode = 400;
    throw error;
  }

  return withTransaction(async (client) => {
    const updateSql = `
      UPDATE fdr_records
      SET status = 'release_requested', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    const res = await client.query(updateSql, [id]);

    const historySql = `
      INSERT INTO fdr_status_history (
        fdr_record_id, changed_by_user_id, previous_status, new_status, notes
      )
      VALUES ($1, $2, $3, 'release_requested', $4);
    `;
    await client.query(historySql, [
      id,
      institutionUser.id,
      fdr.status,
      notes || 'Institution requested deposit release/refund.',
    ]);

    return res.rows[0];
  });
}

/**
 * AICTE Admin approves or rejects FDR release request
 */
export async function decideFdrRelease({ id, adminUser, decision, notes }) {
  const fdr = await getFdrById({ id, user: adminUser });

  if (fdr.status !== 'release_requested') {
    const error = new Error('Can only make release decisions on FDRs in "release_requested" state.');
    error.statusCode = 400;
    throw error;
  }

  const newStatus = decision === 'approved' ? 'release_approved' : 'active';

  return withTransaction(async (client) => {
    const updateSql = `
      UPDATE fdr_records
      SET status = $1,
          lien_marked = CASE WHEN $1 = 'release_approved' THEN FALSE ELSE lien_marked END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;
    const res = await client.query(updateSql, [newStatus, id]);

    const historySql = `
      INSERT INTO fdr_status_history (
        fdr_record_id, changed_by_user_id, previous_status, new_status, notes
      )
      VALUES ($1, $2, $3, $4, $5);
    `;
    await client.query(historySql, [
      id,
      adminUser.id,
      fdr.status,
      newStatus,
      `AICTE Admin decision: ${decision.toUpperCase()}. ${notes}`,
    ]);

    // Send email alert to institution
    await sendAndLogNotification({
      fdrRecordId: id,
      recipientEmail: fdr.institution_email,
      notificationType: `release_${decision}`,
      subject: `AICTE FDR Release Decision: ${decision === 'approved' ? 'APPROVED' : 'REJECTED'} (${fdr.fdr_number})`,
      body: `<p>Your FDR release request for <strong>${fdr.fdr_number}</strong> of amount INR ${fdr.deposit_amount} has been <strong>${decision.toUpperCase()}</strong> by AICTE.</p>
             <p><strong>Admin Remarks:</strong> ${notes}</p>`,
    });

    return res.rows[0];
  });
}

export default {
  createFdr,
  getFdrs,
  getFdrById,
  getFdrDocumentDownloadUrl,
  verifyFdrByBank,
  requestFdrRelease,
  decideFdrRelease,
};
