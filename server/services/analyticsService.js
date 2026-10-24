import { query } from '../config/db.js';
import logger from '../utils/logger.js';

/**
 * Returns comprehensive system analytics & KPIs for AICTE Admin
 */
export async function getAdminSummary() {
  try {
    // 1. Overall stats: total count, total deposit value, average deposit
    const statsSql = `
      SELECT 
        COUNT(*)::int as total_fdrs,
        COALESCE(SUM(deposit_amount), 0)::numeric(15,2) as total_deposit_value,
        COALESCE(SUM(CASE WHEN status IN ('active', 'bank_verified', 'expiring_soon') THEN deposit_amount ELSE 0 END), 0)::numeric(15,2) as total_locked_value,
        COUNT(CASE WHEN status IN ('submitted', 'under_bank_verification') THEN 1 END)::int as pending_bank_verification,
        COUNT(CASE WHEN status = 'release_requested' THEN 1 END)::int as release_requests,
        COUNT(CASE WHEN lien_marked = TRUE THEN 1 END)::int as total_lien_marked
      FROM fdr_records;
    `;
    const statsRes = await query(statsSql);
    const summary = statsRes.rows[0];

    // 2. Count by Status
    const statusSql = `
      SELECT status, COUNT(*)::int as count, COALESCE(SUM(deposit_amount), 0)::numeric(15,2) as total_value
      FROM fdr_records
      GROUP BY status
      ORDER BY count DESC;
    `;
    const statusRes = await query(statusSql);

    // 3. Expiration buckets: expiring in 7 days, 15 days, 30 days, or already expired/matured
    const expirySql = `
      SELECT 
        COUNT(CASE WHEN (maturity_date - CURRENT_DATE) <= 7 AND (maturity_date - CURRENT_DATE) >= 0 AND status NOT IN ('release_approved', 'rejected') THEN 1 END)::int as expiring_7_days,
        COUNT(CASE WHEN (maturity_date - CURRENT_DATE) <= 15 AND (maturity_date - CURRENT_DATE) > 7 AND status NOT IN ('release_approved', 'rejected') THEN 1 END)::int as expiring_15_days,
        COUNT(CASE WHEN (maturity_date - CURRENT_DATE) <= 30 AND (maturity_date - CURRENT_DATE) > 15 AND status NOT IN ('release_approved', 'rejected') THEN 1 END)::int as expiring_30_days,
        COUNT(CASE WHEN maturity_date < CURRENT_DATE AND status NOT IN ('release_approved', 'rejected') THEN 1 END)::int as expired_unreleased
      FROM fdr_records;
    `;
    const expiryRes = await query(expirySql);
    const expiryBuckets = expiryRes.rows[0];

    // 4. Breakdown by Partner Bank
    const bankSql = `
      SELECT 
        COALESCE(b.bank_name, 'Unassigned') as bank_name,
        COUNT(f.id)::int as fdr_count,
        COALESCE(SUM(f.deposit_amount), 0)::numeric(15,2) as total_amount
      FROM fdr_records f
      LEFT JOIN banks b ON f.bank_id = b.id
      GROUP BY b.bank_name
      ORDER BY total_amount DESC
      LIMIT 10;
    `;
    const bankRes = await query(bankSql);

    // 5. Recent Critical Expiries (FDRs maturing within 30 days)
    const criticalFdrsSql = `
      SELECT 
        f.id, f.fdr_number, f.deposit_amount, f.maturity_date, f.status, f.lien_marked,
        i.institution_name, i.contact_email,
        COALESCE(b.bank_name, 'Unassigned') as bank_name,
        (f.maturity_date - CURRENT_DATE) as days_remaining
      FROM fdr_records f
      INNER JOIN institutions i ON f.institution_id = i.id
      LEFT JOIN banks b ON f.bank_id = b.id
      WHERE (f.maturity_date - CURRENT_DATE) <= 30
        AND f.status NOT IN ('release_approved', 'rejected')
      ORDER BY f.maturity_date ASC
      LIMIT 10;
    `;
    const criticalFdrsRes = await query(criticalFdrsSql);

    return {
      kpis: {
        totalFdrs: summary.total_fdrs,
        totalDepositValue: Number(summary.total_deposit_value),
        totalLockedValue: Number(summary.total_locked_value),
        pendingBankVerification: summary.pending_bank_verification,
        releaseRequests: summary.release_requests,
        totalLienMarked: summary.total_lien_marked,
        expiring7Days: expiryBuckets.expiring_7_days,
        expiring15Days: expiryBuckets.expiring_15_days,
        expiring30Days: expiryBuckets.expiring_30_days,
        expiredUnreleased: expiryBuckets.expired_unreleased,
      },
      statusDistribution: statusRes.rows.map((row) => ({
        status: row.status,
        count: row.count,
        totalValue: Number(row.total_value),
      })),
      bankDistribution: bankRes.rows.map((row) => ({
        bankName: row.bank_name,
        fdrCount: row.fdr_count,
        totalAmount: Number(row.total_amount),
      })),
      criticalExpiries: criticalFdrsRes.rows,
    };
  } catch (error) {
    logger.error('Failed to generate admin summary analytics', { error: error.message });
    throw error;
  }
}

export default {
  getAdminSummary,
};
