import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpUser = process.env.SMTP_USER;
const smtpPassword = process.env.SMTP_PASSWORD;
export const mailFrom = process.env.MAIL_FROM || 'TrackTitans <no-reply@tracktitans.in>';

let transporter = null;
export let isMailerConfigured = false;

if (smtpHost && smtpUser && smtpPassword) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });

  transporter.verify((error) => {
    if (error) {
      logger.warn('SMTP transporter verification failed', { error: error.message });
    } else {
      isMailerConfigured = true;
      logger.info('Nodemailer SMTP transporter initialized and verified');
    }
  });
} else {
  logger.warn('SMTP credentials not configured. Outgoing notification emails will be logged to console.');
}

/**
 * Send email helper
 * @param {Object} options 
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.html
 * @param {string} [options.text]
 * @returns {Promise<any>}
 */
export async function sendEmail({ to, subject, html, text }) {
  if (isMailerConfigured && transporter) {
    return transporter.sendMail({
      from: mailFrom,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ''),
      html,
    });
  }

  // Fallback simulator for development/testing
  logger.info(`[SIMULATED EMAIL] To: ${to} | Subject: ${subject}`);
  return {
    simulated: true,
    messageId: `sim-${Date.now()}@tracktitans.local`,
    to,
    subject,
  };
}

export default {
  transporter,
  sendEmail,
  isMailerConfigured,
  mailFrom,
};
