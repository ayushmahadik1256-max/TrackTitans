import cron from 'node-cron';
import { query } from '../config/db.js';
import { sendAndLogNotification, hasExistingNotification } from '../services/notificationService.js';
import logger from '../utils/logger.js';

/**
 * Checks all FDRs for upcoming maturity thresholds (30, 15, 7 days) and expired statuses.
 */
export async function runMaturityCheck() {
  logger.info('[CRON JOB] Starting daily institutional FDR maturity compliance check...');
  const results = {
    processed: 0,
    alertsSent: 0,
    maturedUpdated: 0,
    errors: [],
  };

  try {
    // 1. Fetch eligible FDR records
    const sql = `
      SELECT 
        f.id, f.fdr_number, f.deposit_amount, f.maturity_date, f.status, f.lien_marked,
        i.institution_name, i.contact_email, i.aicte_application_id,
        COALESCE(b.bank_name, 'Bank') as bank_name,
        (f.maturity_date - CURRENT_DATE) as days_remaining
      FROM fdr_records f
      INNER JOIN institutions i ON f.institution_id = i.id
      LEFT JOIN banks b ON f.bank_id = b.id
      WHERE f.status NOT IN ('release_approved', 'rejected');
    `;

    const res = await query(sql);
    results.processed = res.rows.length;

    for (const fdr of res.rows) {
      const days = parseInt(fdr.days_remaining, 10);

      // Check if maturity date has passed
      if (days < 0 && fdr.status !== 'matured' && fdr.status !== 'release_requested') {
        await query(
          `UPDATE fdr_records SET status = 'matured', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [fdr.id]
        );

        await query(
          `INSERT INTO fdr_status_history (fdr_record_id, previous_status, new_status, notes)
           VALUES ($1, $2, 'matured', 'Automated system update: FDR passed maturity date without release.')`,
          [fdr.id, fdr.status]
        );

        results.maturedUpdated++;
        logger.info(`[CRON JOB] FDR ${fdr.fdr_number} marked as matured.`);
        continue;
      }

      // Check 30, 15, 7 days thresholds
      const thresholds = [30, 15, 7];
      if (thresholds.includes(days)) {
        const alertType = `maturity_alert_${days}_days`;

        // Check for duplicate alert
        const alreadyNotified = await hasExistingNotification(fdr.id, alertType);

        if (!alreadyNotified) {
          const formattedAmount = Number(fdr.deposit_amount).toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
          });

          const urgencyLevel = days <= 7 ? 'CRITICAL URGENT' : days <= 15 ? 'HIGH PRIORITY' : 'COMPLIANCE NOTICE';

          const emailSubject = `[${urgencyLevel}] AICTE FDR Maturing in ${days} Days: ${fdr.fdr_number}`;
          const emailBody = `
            <p>Dear Principal / Finance Officer of <strong>${fdr.institution_name}</strong>,</p>
            <p>This is an automated regulatory notification regarding your institutional Security Deposit Fixed Deposit Receipt (FDR) held in trust with AICTE.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr style="background: #f8fafc;"><td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>FDR Number</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">${fdr.fdr_number}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>AICTE Application ID</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">${fdr.aicte_application_id}</td></tr>
              <tr style="background: #f8fafc;"><td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Bank</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">${fdr.bank_name}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Deposit Amount</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">${formattedAmount}</td></tr>
              <tr style="background: #f8fafc;"><td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Maturity Date</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1; color: #dc2626; font-weight: bold;">${fdr.maturity_date} (${days} days remaining)</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Lien Status</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">${fdr.lien_marked ? 'Lien Marked in Favor of AICTE' : 'Lien Not Marked'}</td></tr>
            </table>

            <p><strong>Required Regulatory Action:</strong></p>
            <ul>
              <li>If renewal is mandated for ongoing course approvals, initiate FDR roll-over with your bank and upload the renewed FDR receipt in TrackTitans.</li>
              <li>If your mandatory tenure (e.g., 8-10 years) has ended and courses are operational, you may initiate an AICTE Release Request from your portal dashboard.</li>
            </ul>

            <p>Please log in to your TrackTitans portal to verify document compliance status.</p>
          `;

          const sendResult = await sendAndLogNotification({
            fdrRecordId: fdr.id,
            recipientEmail: fdr.contact_email,
            notificationType: alertType,
            subject: emailSubject,
            body: emailBody,
          });

          if (sendResult.success) {
            results.alertsSent++;

            // Update status to 'expiring_soon' if not already marked
            if (fdr.status === 'active' || fdr.status === 'bank_verified') {
              await query(
                `UPDATE fdr_records SET status = 'expiring_soon', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                [fdr.id]
              );
              await query(
                `INSERT INTO fdr_status_history (fdr_record_id, previous_status, new_status, notes)
                 VALUES ($1, $2, 'expiring_soon', $3)`,
                [fdr.id, fdr.status, `Maturity alert sent: ${days} days remaining until maturity.`]
              );
            }
          }
        }
      }
    }

    logger.info('[CRON JOB] Maturity compliance check completed successfully.', results);
    return results;
  } catch (error) {
    logger.error('[CRON JOB] Error during maturity compliance check', { error: error.message });
    throw error;
  }
}

/**
 * Initializes daily node-cron schedule at 9:00 AM IST (Asia/Kolkata)
 */
export function startMaturityAlertJob() {
  const timezone = process.env.CRON_TIMEZONE || 'Asia/Kolkata';

  // Schedule for 9:00 AM every day
  const task = cron.schedule(
    '0 9 * * *',
    async () => {
      logger.info(`[CRON TRIGGERED] Running scheduled 9:00 AM alert check in timezone: ${timezone}`);
      try {
        await runMaturityCheck();
      } catch (err) {
        logger.error('[CRON TRIGGERED] Scheduled execution failed', { error: err.message });
      }
    },
    {
      timezone,
    }
  );

  logger.info(`Maturity alert cron job registered (0 9 * * * in ${timezone})`);
  return task;
}

export default {
  startMaturityAlertJob,
  runMaturityCheck,
};
