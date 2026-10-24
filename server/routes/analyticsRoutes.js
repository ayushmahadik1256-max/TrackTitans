import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import analyticsController from '../controllers/analyticsController.js';

const router = express.Router();

// AICTE admin summary and KPIs
router.get(
  '/summary',
  authenticate,
  requireRole('aicte_admin'),
  analyticsController.getSummary
);

export default router;
