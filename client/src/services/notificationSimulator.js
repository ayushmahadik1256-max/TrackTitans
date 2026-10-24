import apiClient from '../config/api.js';

// Local storage key for simulated email store
const EMAIL_STORE_KEY = 'tracktitans_simulated_emails';

// Pre-seeded initial simulated emails matching the database seed
const INITIAL_SIMULATED_EMAILS = [
  {
    id: 'email-seed-01',
    fdrId: 'a0000002-0000-0000-0000-000000000002',
    fdrNumber: 'SBI-DEL-FDR-2021-41902',
    recipientEmail: 'registrar@delhitechnical.edu.in',
    sender: 'TrackTitans AICTE Portal <no-reply@tracktitans.in>',
    notificationType: 'maturity_alert_7_days',
    urgency: 'critical',
    subject: '[CRITICAL URGENT] AICTE FDR Maturing in 7 Days: SBI-DEL-FDR-2021-41902',
    status: 'sent',
    sentAt: new Date(Date.now() - 3600000).toISOString(),
    transporter: 'Nodemailer SMTP Transporter',
    messageId: 'msg-sbi-7d-41902@tracktitans.in',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="background-color: #1e293b; padding: 16px; border-radius: 6px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: #ffffff; margin: 0; font-size: 20px;">TrackTitans | AICTE FDR Compliance Portal</h2>
        </div>
        <div style="color: #334155; line-height: 1.6;">
          <p>Dear Principal / Finance Officer of <strong>Delhi Institute of Engineering & Technology</strong>,</p>
          <p>This is an automated regulatory notification regarding your institutional Security Deposit Fixed Deposit Receipt (FDR) held in trust with AICTE.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr style="background: #f8fafc;"><td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>FDR Number</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">SBI-DEL-FDR-2021-41902</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>AICTE Application ID</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">AICTE-1-9321482910</td></tr>
            <tr style="background: #f8fafc;"><td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Bank</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">State Bank of India</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Deposit Amount</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">₹50,00,000.00</td></tr>
            <tr style="background: #f8fafc;"><td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Maturity Date</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1; color: #dc2626; font-weight: bold;">2026-10-31 (7 days remaining)</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Lien Status</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1; color: #16a34a; font-weight: bold;">Lien Marked in Favor of Member Secretary AICTE</td></tr>
          </table>

          <p><strong>Required Regulatory Action:</strong></p>
          <ul>
            <li>If course approvals are ongoing, execute a renewal receipt with the branch manager and upload the renewed document in TrackTitans.</li>
            <li>If mandatory 10-year term has completed, submit an online Release Application from your institution portal.</li>
          </ul>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 11px; color: #64748b; text-align: center;">
          Dispatched via Nodemailer SMTP Service • All India Council for Technical Education (AICTE)
        </p>
      </div>
    `,
  },
  {
    id: 'email-seed-02',
    fdrId: 'a0000003-0000-0000-0000-000000000003',
    fdrNumber: 'PNB-MUM-FDR-2022-77123',
    recipientEmail: 'finance@mumbaitech.ac.in',
    sender: 'TrackTitans AICTE Portal <no-reply@tracktitans.in>',
    notificationType: 'maturity_alert_15_days',
    urgency: 'urgent',
    subject: '[HIGH PRIORITY] AICTE FDR Maturing in 15 Days: PNB-MUM-FDR-2022-77123',
    status: 'sent',
    sentAt: new Date(Date.now() - 86400000).toISOString(),
    transporter: 'Nodemailer SMTP Transporter',
    messageId: 'msg-pnb-15d-77123@tracktitans.in',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="background-color: #1e293b; padding: 16px; border-radius: 6px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: #ffffff; margin: 0; font-size: 20px;">TrackTitans | AICTE FDR Compliance Portal</h2>
        </div>
        <div style="color: #334155; line-height: 1.6;">
          <p>Dear Head of Institution / Finance Officer,</p>
          <p>Your Fixed Deposit Receipt with Punjab National Bank of value <strong>₹25,00,000.00</strong> will mature in <strong>15 days (2026-11-08)</strong>.</p>
          <p>Please coordinate with Punjab National Bank for rollover or prepare release documentation.</p>
        </div>
      </div>
    `,
  }
];

/**
 * Retrieve all logged simulated emails
 */
export function getSimulatedEmails() {
  try {
    const raw = localStorage.getItem(EMAIL_STORE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Could not read simulated email store from localStorage:', err);
  }
  return INITIAL_SIMULATED_EMAILS;
}

/**
 * Save simulated email into memory and localStorage
 */
function saveEmail(emailObj) {
  const current = getSimulatedEmails();
  const updated = [emailObj, ...current];
  try {
    localStorage.setItem(EMAIL_STORE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Could not save simulated email to localStorage:', err);
  }
  return updated;
}

/**
 * Trigger simulated email notification for a specific FDR maturing within 30 days
 */
export async function triggerMaturityAlert(fdr, daysRemainingOverride) {
  const days = daysRemainingOverride !== undefined
    ? daysRemainingOverride
    : (fdr.days_to_maturity !== undefined
        ? fdr.days_to_maturity
        : Math.ceil((new Date(fdr.maturity_date) - new Date()) / (1000 * 60 * 60 * 24)));

  const recipientEmail = fdr.institution_email || fdr.contact_email || 'registrar@institution.edu.in';
  const formattedAmount = Number(fdr.deposit_amount).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
  });

  const urgencyTag = days <= 7 ? 'CRITICAL URGENT' : days <= 15 ? 'HIGH PRIORITY' : 'COMPLIANCE NOTICE';
  const urgencyLevel = days <= 7 ? 'critical' : days <= 15 ? 'urgent' : 'notice';
  const subject = `[${urgencyTag}] AICTE FDR Maturing in ${days} Days: ${fdr.fdr_number}`;

  const bodyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <div style="background-color: #1e293b; padding: 16px; border-radius: 6px; text-align: center; margin-bottom: 20px;">
        <h2 style="color: #ffffff; margin: 0; font-size: 20px;">TrackTitans | AICTE FDR Compliance Portal</h2>
      </div>
      <div style="color: #334155; line-height: 1.6;">
        <p>Dear Principal / Finance Officer of <strong>${fdr.institution_name || 'Technical Institution'}</strong>,</p>
        <p>This is an automated regulatory notification regarding your institutional Security Deposit Fixed Deposit Receipt (FDR) held in trust with AICTE.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr style="background: #f8fafc;"><td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>FDR Certificate Number</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace;">${fdr.fdr_number}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>AICTE Application ID</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">${fdr.aicte_application_id || 'AICTE-REG'}</td></tr>
          <tr style="background: #f8fafc;"><td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Partner Bank & Branch</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">${fdr.bank_name || 'Bank'} (${fdr.branch_name || 'Main'})</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Deposit Guarantee Amount</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #047857;">${formattedAmount}</td></tr>
          <tr style="background: #f8fafc;"><td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Maturity Date</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1; color: #dc2626; font-weight: bold;">${fdr.maturity_date} (${days} days remaining)</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Lien Endorsement</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1; color: #16a34a;">${fdr.lien_marked ? 'Lien Marked in Favor of Member Secretary AICTE' : 'Lien Not Marked'}</td></tr>
        </table>

        <p><strong>Mandatory Regulatory Action Required:</strong></p>
        <ul>
          <li><strong>Course Continuation / Expansion:</strong> If approval is active for ongoing programs, execute an FDR roll-over with the bank branch and upload the renewed deposit certificate in TrackTitans.</li>
          <li><strong>Security Deposit Refund:</strong> If mandatory regulatory tenure (8-10 years) has ended and compliance criteria are met, initiate an AICTE Release Request from your TrackTitans portal.</li>
        </ul>

        <p>Failure to respond prior to maturity date will result in non-compliance flags in the AICTE national approval registry.</p>
      </div>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 11px; color: #64748b; text-align: center;">
        Dispatched by Nodemailer Transporter • Automated 9:00 AM IST Cron Protocol • TrackTitans SIH26265
      </p>
    </div>
  `;

  // Try calling backend API route if available
  try {
    await apiClient.post('/jobs/trigger-maturity-check').catch(() => null);
  } catch (err) {
    // continue
  }

  const newEmail = {
    id: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    fdrId: fdr.id,
    fdrNumber: fdr.fdr_number,
    recipientEmail,
    sender: 'TrackTitans AICTE Portal <no-reply@tracktitans.in>',
    notificationType: `maturity_alert_${days}_days`,
    urgency: urgencyLevel,
    subject,
    status: 'sent',
    sentAt: new Date().toISOString(),
    transporter: 'Nodemailer SMTP Transporter (port 587)',
    messageId: `sim-${Date.now()}@tracktitans.in`,
    bodyHtml,
  };

  saveEmail(newEmail);
  return newEmail;
}

/**
 * Trigger simulated alerts for ALL FDRs maturing within 30 days
 */
export async function triggerAll30DayAlerts(fdrs = []) {
  const eligible = fdrs.filter(f => {
    const days = f.days_to_maturity !== undefined
      ? f.days_to_maturity
      : Math.ceil((new Date(fdr.maturity_date) - new Date()) / (1000 * 60 * 60 * 24));
    return days <= 30 && days >= 0 && f.status !== 'release_approved';
  });

  const dispatched = [];
  for (const fdr of eligible) {
    const email = await triggerMaturityAlert(fdr);
    dispatched.push(email);
  }
  return dispatched;
}

export default {
  getSimulatedEmails,
  triggerMaturityAlert,
  triggerAll30DayAlerts,
};
