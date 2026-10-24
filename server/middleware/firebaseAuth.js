import admin, { isConfigured } from '../config/firebaseAdmin.js';
import { query } from '../config/db.js';
import logger from '../utils/logger.js';

/**
 * Middleware to verify Firebase ID Token from Authorization header
 * and attach authenticated PostgreSQL user to req.user.
 */
export async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Missing or malformed Authorization Bearer token.',
      errors: ['Authorization header with Bearer token is required.'],
    });
  }

  const idToken = authHeader.split('Bearer ')[1].trim();

  if (!idToken) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Bearer token is empty.',
      errors: ['Empty authentication token provided.'],
    });
  }

  try {
    let decodedToken = null;

    if (isConfigured) {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } else {
      // Development mock fallback: decode or identify test users when Firebase Admin keys aren't set
      if (idToken.startsWith('mock-token-') || idToken.startsWith('demo-')) {
        const mockRole = idToken.includes('admin')
          ? 'aicte_admin'
          : idToken.includes('bank')
          ? 'bank'
          : 'institution';

        decodedToken = {
          uid: `demo_uid_${mockRole}`,
          email: `${mockRole}@tracktitans.local`,
          name: `Demo ${mockRole.toUpperCase()} User`,
        };
      } else {
        // Attempt admin verification or handle decode
        try {
          decodedToken = await admin.auth().verifyIdToken(idToken);
        } catch {
          decodedToken = {
            uid: `uid_${idToken.slice(0, 16)}`,
            email: 'user@example.com',
          };
        }
      }
    }

    if (!decodedToken || !decodedToken.uid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Firebase ID token.',
        errors: ['Token validation failed.'],
      });
    }

    // Attach decoded Firebase claims
    req.firebaseUser = decodedToken;

    // Lookup user in PostgreSQL database
    try {
      const userRes = await query(
        'SELECT id, firebase_uid, email, full_name, role, institution_name, bank_name, phone, is_active FROM users WHERE firebase_uid = $1 LIMIT 1',
        [decodedToken.uid]
      );

      if (userRes.rows.length > 0) {
        const user = userRes.rows[0];
        if (!user.is_active) {
          return res.status(403).json({
            success: false,
            message: 'User account is deactivated. Contact AICTE support.',
            errors: ['Inactive account.'],
          });
        }
        req.user = user;
      } else {
        // User is authenticated in Firebase but not yet synced to PostgreSQL
        req.user = {
          firebase_uid: decodedToken.uid,
          email: decodedToken.email || '',
          full_name: decodedToken.name || '',
          role: null, // Must sync profile to acquire role
          is_synced: false,
        };
      }
    } catch (dbErr) {
      logger.warn('Failed to query user from PostgreSQL in auth middleware, using claims', { error: dbErr.message });
      req.user = {
        firebase_uid: decodedToken.uid,
        email: decodedToken.email || '',
        role: decodedToken.role || 'institution',
      };
    }

    next();
  } catch (error) {
    logger.error('Firebase token verification failed', { error: error.message });
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. The provided token is invalid, expired, or revoked.',
      errors: [error.message],
    });
  }
}

export default verifyFirebaseToken;
