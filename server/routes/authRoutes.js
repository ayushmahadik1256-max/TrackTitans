import express from 'express';
import { verifyFirebaseToken } from '../middleware/firebaseAuth.js';
import authController from '../controllers/authController.js';

const router = express.Router();

// Synchronize or create user profile with role assignment
router.post('/sync-user', verifyFirebaseToken, authController.syncUser);

// Retrieve current authenticated user profile
router.get('/me', verifyFirebaseToken, authController.getMe);

export default router;
