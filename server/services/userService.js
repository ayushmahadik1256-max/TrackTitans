import { query, withTransaction } from '../config/db.js';
import logger from '../utils/logger.js';

/**
 * Synchronize Firebase Authenticated User into PostgreSQL database
 * 
 * @param {Object} firebaseUser Decoded Firebase token payload
 * @param {Object} profile Profile parameters (role, name, etc.)
 */
export async function syncUserProfile(firebaseUser, profile) {
  const { uid, email } = firebaseUser;
  const {
    role,
    full_name,
    institution_name,
    aicte_application_id,
    bank_name,
    branch_name,
    ifsc_code,
    address,
    state,
    phone,
  } = profile;

  return withTransaction(async (client) => {
    // 1. Upsert into users table
    const upsertUserSql = `
      INSERT INTO users (
        firebase_uid, email, full_name, role, institution_name, bank_name, phone, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      ON CONFLICT (firebase_uid) 
      DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, users.full_name),
        role = COALESCE(users.role, EXCLUDED.role),
        institution_name = COALESCE(EXCLUDED.institution_name, users.institution_name),
        bank_name = COALESCE(EXCLUDED.bank_name, users.bank_name),
        phone = COALESCE(EXCLUDED.phone, users.phone),
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, firebase_uid, email, full_name, role, institution_name, bank_name, phone, is_active, created_at;
    `;

    const userRes = await client.query(upsertUserSql, [
      uid,
      email || `${uid}@tracktitans.local`,
      full_name || 'Authorized User',
      role,
      institution_name || null,
      bank_name || null,
      phone || null,
    ]);

    const user = userRes.rows[0];

    // 2. If institution role, upsert into institutions table
    let institution = null;
    if (user.role === 'institution') {
      const appId = aicte_application_id || `AICTE-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      const instName = institution_name || user.institution_name || 'Affiliated Technical Institute';

      const upsertInstSql = `
        INSERT INTO institutions (
          user_id, aicte_application_id, institution_name, address, state, contact_email, contact_phone
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (aicte_application_id)
        DO UPDATE SET
          institution_name = EXCLUDED.institution_name,
          address = COALESCE(EXCLUDED.address, institutions.address),
          state = COALESCE(EXCLUDED.state, institutions.state),
          contact_email = EXCLUDED.contact_email,
          contact_phone = COALESCE(EXCLUDED.contact_phone, institutions.contact_phone)
        RETURNING id, user_id, aicte_application_id, institution_name, address, state, contact_email, contact_phone;
      `;

      const instRes = await client.query(upsertInstSql, [
        user.id,
        appId,
        instName,
        address || 'Campus Address',
        state || 'Delhi',
        user.email,
        phone || null,
      ]);

      institution = instRes.rows[0];
    }

    // 3. If bank role, upsert into banks table
    let bank = null;
    if (user.role === 'bank') {
      const bName = bank_name || user.bank_name || 'Partner Commercial Bank';
      const bBranch = branch_name || 'Main Treasury Branch';
      const bIfsc = ifsc_code || 'BANK0001234';

      const checkBankSql = `SELECT id, bank_name, branch_name, ifsc_code FROM banks WHERE user_id = $1 LIMIT 1`;
      const existingBank = await client.query(checkBankSql, [user.id]);

      if (existingBank.rows.length > 0) {
        bank = existingBank.rows[0];
      } else {
        const insertBankSql = `
          INSERT INTO banks (user_id, bank_name, branch_name, ifsc_code)
          VALUES ($1, $2, $3, $4)
          RETURNING id, user_id, bank_name, branch_name, ifsc_code;
        `;
        const bankRes = await client.query(insertBankSql, [user.id, bName, bBranch, bIfsc]);
        bank = bankRes.rows[0];
      }
    }

    logger.info('User synchronized successfully', { userId: user.id, role: user.role, email: user.email });

    return {
      ...user,
      institution,
      bank,
    };
  });
}

/**
 * Get user by ID or Firebase UID
 */
export async function getUserById(userId) {
  const sql = `
    SELECT u.id, u.firebase_uid, u.email, u.full_name, u.role, u.institution_name, u.bank_name, u.phone, u.is_active,
           i.id as institution_id, i.aicte_application_id,
           b.id as bank_id, b.branch_name, b.ifsc_code
    FROM users u
    LEFT JOIN institutions i ON i.user_id = u.id
    LEFT JOIN banks b ON b.user_id = u.id
    WHERE u.id = $1 OR u.firebase_uid = $1
    LIMIT 1;
  `;
  const res = await query(sql, [userId]);
  return res.rows[0] || null;
}

export default {
  syncUserProfile,
  getUserById,
};
