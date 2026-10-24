import admin from 'firebase-admin';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

let firebaseApp = null;
let isConfigured = false;

try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // Handle escaped newlines from environment variable strings
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (projectId && clientEmail && privateKey) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    isConfigured = true;
    logger.info('Firebase Admin SDK initialized successfully with service account');
  } else {
    logger.warn('Firebase Admin credentials not fully configured in environment. ID token verification will run in development fallback mode.');
  }
} catch (error) {
  logger.error('Error initializing Firebase Admin SDK', { error: error.message });
}

export const auth = admin.auth;
export { admin, isConfigured };
export default admin;
