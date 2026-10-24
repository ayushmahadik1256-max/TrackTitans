import { syncUserSchema } from '../validators/fdrValidator.js';
import userService from '../services/userService.js';
import logger from '../utils/logger.js';

/**
 * Sync user profile after Firebase Authentication
 * Route: POST /api/auth/sync-user
 */
export async function syncUser(req, res, next) {
  try {
    const validatedData = syncUserSchema.parse(req.body);

    const userProfile = await userService.syncUserProfile(req.firebaseUser, validatedData);

    return res.status(200).json({
      success: true,
      message: 'User synchronized successfully.',
      data: userProfile,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieve current authenticated user profile
 * Route: GET /api/auth/me
 */
export async function getMe(req, res, next) {
  try {
    const user = await userService.getUserById(req.user.id);
    return res.status(200).json({
      success: true,
      data: user || req.user,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  syncUser,
  getMe,
};
