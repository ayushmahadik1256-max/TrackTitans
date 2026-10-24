import { verifyToken } from '../utils/jwt.js';
import { getUserById } from '../services/userService.js';
import logger from '../utils/logger.js';

/**
 * Standard JWT Authentication Middleware for TrackTitans Neon PostgreSQL backend
 * Verifies Authorization: Bearer <token> and attaches authenticated database user to req.user.
 */
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Missing or malformed Authorization Bearer token.',
      errors: ['Authorization header with Bearer token is required.'],
    });
  }

  const token = authHeader.split('Bearer ')[1].trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Bearer token is empty.',
      errors: ['Empty authentication token provided.'],
    });
  }

  try {
    // 1. Verify and decode HMAC JWT
    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session token.',
        errors: ['Token payload does not contain a valid user identifier.'],
      });
    }

    // 2. Fetch fresh user record from Neon PostgreSQL database
    const user = await getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found in database.',
        errors: ['The account associated with this token no longer exists.'],
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact AICTE Administrator.',
        errors: ['Inactive account.'],
      });
    }

    // Attach verified user to request
    req.user = user;
    next();
  } catch (error) {
    logger.warn('Token verification error', { error: error.message });
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. The session token is invalid or expired. Please sign in again.',
      errors: [error.message],
    });
  }
}

// Backward compatibility alias for routes importing verifyFirebaseToken
export const verifyFirebaseToken = authenticate;

export default authenticate;
