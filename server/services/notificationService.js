import { query } from '../config/db.js';
import { sendEmail } from '../config/mailer.js';
import logger from '../utils/logger.js';

/**
 * Send notification and record audit log in PostgreSQL
 * 
 * @param {Object} options
 * @param {string} [options.fdrRecordId]
 * @param {string} options.recipientEmail
 * @param {string} options.notificationType e.g., 'maturity_alert_30_days', 'release_approved'
 * @param {string} options.subject
 * @param {string} options.body
 */
export async function sendAndLogNotification({
  fdrRecordId = null,
  recipientEmail,
  notificationType,
  subject,
  body,
}) {
  let notificationId = null;

  try {
    // 1. Insert queued record
    const insertSql = `
      INSERT INTO notifications (
        fdr_record_id, recipient_email, notification_type, subject, body, status
      )
      VALUES ($1, $2, $3, $4, $5, 'queued')
      RETURNING id;
    `;
    const res = await query(insertSql, [fdrRecordId, recipientEmail, notificationType, subject, body]);
    notificationId = res.rows[0].id;

    // 2. Dispatch via Nodemailer
    await sendEmail({
      to: recipientEmail,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="background-color: #1e293b; padding: 16px; border-radius: 6px; text-align: center; margin-bottom: 20px;">
            <h2 style="color: #ffffff; margin: 0; font-size: 20px;">TrackTitans | AICTE FDR Compliance Portal</h2>
          </div>
          <div style="color: #334155; line-height: 1.6;">
            ${body}
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #64748b; text-align: center;">
            This is an automated regulatory compliance notification issued on behalf of All India Council for Technical Education (AICTE).
          </p>
        </div>
      `,
    });

    // 3. Mark as sent
    await query(
      `UPDATE notifications SET status = 'sent', sent_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [notificationId]
    );

    logger.info('Notification successfully dispatched and logged', {
      notificationId,
      recipientEmail,
      notificationType,
    });

    return { success: true, notificationId };
  } catch (error) {
    logger.error('Failed to send notification', {
      notificationId,
      recipientEmail,
      error: error.message,
    });

    if (notificationId) {
      await query(
        `UPDATE notifications SET status = 'failed', error_message = $1 WHERE id = $2`,
        [error.message, notificationId]
      );
    }

    return { success: false, error: error.message };
  }
}

/**
 * Check if a notification of a specific type has already been sent for an FDR
 */
export async function hasExistingNotification(fdrRecordId, notificationType) {
  const sql = `
    SELECT id FROM notifications 
    WHERE fdr_record_id = $1 AND notification_type = $2 AND status = 'sent'
    LIMIT 1;
  `;
  const res = await query(sql, [fdrRecordId, notificationType]);
  return res.rows.length > 0;
}

export default {
  sendAndLogNotification,
  hasExistingNotification,
};
