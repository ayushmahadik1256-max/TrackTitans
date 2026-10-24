import logger from '../utils/logger.js';

/**
 * Middleware to enforce strict Role-Based Access Control (RBAC).
 * Roles are strictly retrieved from PostgreSQL and never trusted from client payloads.
 * Allowed roles: 'institution', 'bank', 'aicte_admin'
 * 
 * @param {string|string[]} allowedRoles 
 */
export function requireRole(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      logger.warn('Role check failed: Unassigned or missing user role', {
        uid: req.user ? req.user.firebase_uid : 'unknown',
      });
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Your user profile does not have an assigned role.',
        errors: ['Role assignment required before accessing this endpoint.'],
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Role access denied', {
        userRole: req.user.role,
        requiredRoles: roles,
        userId: req.user.id,
      });
      return res.status(403).json({
        success: false,
        message: `Forbidden. This operation requires one of the following roles: [${roles.join(', ')}].`,
        errors: [`Current role '${req.user.role}' is not authorized.`],
      });
    }

    next();
  };
}

export default requireRole;
