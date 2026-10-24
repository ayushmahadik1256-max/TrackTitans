import { registerUserSchema, loginUserSchema, syncUserSchema } from '../validators/fdrValidator.js';
import userService from '../services/userService.js';
import { generateToken } from '../utils/jwt.js';
import logger from '../utils/logger.js';

/**
 * Register new user with credentials directly in Neon PostgreSQL
 * Route: POST /api/auth/register
 */
export async function register(req, res, next) {
  try {
    const validatedData = registerUserSchema.parse(req.body);

    const user = await userService.registerUser(validatedData);
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      data: user,
      user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Authenticate existing user with email and password from Neon PostgreSQL
 * Route: POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = loginUserSchema.parse(req.body);

    const user = await userService.loginUser(email, password);
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      token,
      data: user,
      user,
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
      user: user || req.user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Legacy sync user profile endpoint (backward compatibility)
 * Route: POST /api/auth/sync-user
 */
export async function syncUser(req, res, next) {
  try {
    const validatedData = syncUserSchema.parse(req.body);
    const userProfile = await userService.syncUserProfile(req.firebaseUser || req.user, validatedData);

    return res.status(200).json({
      success: true,
      message: 'User synchronized successfully.',
      data: userProfile,
      user: userProfile,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  register,
  login,
  getMe,
  syncUser,
};
