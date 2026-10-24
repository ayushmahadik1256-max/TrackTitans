import express from 'express';
import { authenticate } from '../middleware/auth.js';
import authController from '../controllers/authController.js';

const router = express.Router();

// 1. Native Neon PostgreSQL registration with bcrypt password hashing
router.post('/register', authController.register);

// 2. Native Neon PostgreSQL authentication with JWT token issuance
router.post('/login', authController.login);

// 3. Retrieve current authenticated user profile
router.get('/me', authenticate, authController.getMe);

// 4. Legacy sync user profile endpoint (backward compatibility)
router.post('/sync-user', authenticate, authController.syncUser);

export default router;
