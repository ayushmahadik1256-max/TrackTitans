import express from 'express';
import { query } from '../config/db.js';
import { verifyFirebaseToken } from '../middleware/firebaseAuth.js';
import { sendAndLogNotification } from '../services/notificationService.js';
import { sendEmail, mailFrom, isMailerConfigured } from '../config/mailer.js';
import logger from '../utils/logger.js';

const router = express.Router();

router.use(verifyFirebaseToken);

/**
 * Trigger simulated email alert for an FDR within 30 days using Nodemailer
 * Route: POST /api/notifications/simulate-alert
 */
router.post('/simulate-alert', async (req, res, next) => {
  try {
    const { fdr_id, custom_days } = req.body;

    let fdr = null;
    if (fdr_id) {
      const fdrRes = await query(
        `SELECT f.*, i.institution_name, i.contact_email, i.aicte_application_id, b.bank_name, b.branch_name,
                (f.maturity_date - CURRENT_DATE) as days_remaining
         FROM fdr_records f
         INNER JOIN institutions i ON f.institution_id = i.id
         LEFT JOIN banks b ON f.bank_id = b.id
         WHERE f.id = $1 LIMIT 1`,
        [fdr_id]
      );
      fdr = fdrRes.rows[0];
    } else {
      // Find first FDR maturing within 30 days
      const fdrRes = await query(
        `SELECT f.*, i.institution_name, i.contact_email, i.aicte_application_id, b.bank_name, b.branch_name,
                (f.maturity_date - CURRENT_DATE) as days_remaining
         FROM fdr_records f
         INNER JOIN institutions i ON f.institution_id = i.id
         LEFT JOIN banks b ON f.bank_id = b.id
         WHERE (f.maturity_date - CURRENT_DATE) <= 30 AND f.status NOT IN ('release_approved', 'rejected')
         ORDER BY f.maturity_date ASC LIMIT 1`
      );
      fdr = fdrRes.rows[0];
    }

    if (!fdr) {
      return res.status(404).json({
        success: false,
        message: 'No eligible FDR found within the 30-day maturity threshold.',
      });
    }

    const days = custom_days !== undefined ? parseInt(custom_days, 10) : parseInt(fdr.days_remaining, 10);
    const urgency = days <= 7 ? 'CRITICAL URGENT' : days <= 15 ? 'HIGH PRIORITY' : 'COMPLIANCE NOTICE';
    const alertType = `simulated_maturity_alert_${days}_days`;
    const subject = `[${urgency}] AICTE FDR Maturing in ${days} Days: ${fdr.fdr_number}`;

    const formattedAmount = Number(fdr.deposit_amount).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });

    const body = `
      <p>Dear Principal / Finance Officer of <strong>${fdr.institution_name}</strong>,</p>
      <p>This is an automated regulatory notification regarding your institutional Security Deposit Fixed Deposit Receipt (FDR) held in trust with AICTE.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr style="background: #f8fafc;"><td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>FDR Certificate Number</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace;">${fdr.fdr_number}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>AICTE Application ID</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">${fdr.aicte_application_id}</td></tr>
        <tr style="background: #f8fafc;"><td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Bank</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">${fdr.bank_name || 'Commercial Bank'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Deposit Guarantee Amount</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1; color: #047857; font-weight: bold;">${formattedAmount}</td></tr>
        <tr style="background: #f8fafc;"><td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Maturity Date</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1; color: #dc2626; font-weight: bold;">${fdr.maturity_date} (${days} days remaining)</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Lien Status</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1; color: #16a34a;">${fdr.lien_marked ? 'Lien Marked in Favor of Member Secretary AICTE' : 'Lien Not Marked'}</td></tr>
      </table>

      <p><strong>Required Regulatory Actions:</strong></p>
      <ul>
        <li><strong>Course Continuation:</strong> If ongoing course approval is required, execute a renewal receipt with the branch manager and upload the renewed document in TrackTitans.</li>
        <li><strong>Deposit Refund:</strong> If mandatory regulatory tenure (8-10 years) has concluded, initiate an AICTE Release Request from your portal.</li>
      </ul>
    `;

    const recipient = fdr.contact_email || 'registrar@delhitechnical.edu.in';

    // Dispatch via Nodemailer configuration
    const dispatchResult = await sendAndLogNotification({
      fdrRecordId: fdr.id,
      recipientEmail: recipient,
      notificationType: alertType,
      subject,
      body,
    });

    return res.status(200).json({
      success: true,
      message: `Simulated maturity alert email successfully dispatched via Nodemailer to ${recipient}.`,
      data: {
        fdrNumber: fdr.fdr_number,
        recipient,
        subject,
        daysRemaining: days,
        urgency,
        transporterConfigured: isMailerConfigured,
        dispatchResult,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * List recent logged email notifications
 * Route: GET /api/notifications
 */
router.get('/', async (req, res, next) => {
  try {
    const listRes = await query(
      `SELECT n.*, f.fdr_number
       FROM notifications n
       LEFT JOIN fdr_records f ON n.fdr_record_id = f.id
       ORDER BY n.created_at DESC LIMIT 50`
    );

    return res.status(200).json({
      success: true,
      data: listRes.rows,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
