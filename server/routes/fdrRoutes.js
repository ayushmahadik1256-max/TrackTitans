import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { uploadFdrDocument } from '../middleware/upload.js';
import fdrController from '../controllers/fdrController.js';

const router = express.Router();

// Apply unified JWT token verification to all FDR routes
router.use(authenticate);

// 1. Submit FDR (Institution only)
router.post(
  '/',
  requireRole('institution'),
  uploadFdrDocument,
  fdrController.createFdr
);

// 2. List FDRs (Role-scoped in service)
router.get(
  '/',
  requireRole(['institution', 'bank', 'aicte_admin']),
  fdrController.getFdrs
);

// 3. View single FDR record details and audit history
router.get(
  '/:id',
  requireRole(['institution', 'bank', 'aicte_admin']),
  fdrController.getFdrById
);

// 4. Generate pre-signed URL for FDR PDF document download
router.get(
  '/:id/document',
  requireRole(['institution', 'bank', 'aicte_admin']),
  fdrController.getFdrDocument
);

// 5. Bank verification and lien confirmation (Bank only)
router.patch(
  '/:id/verify',
  requireRole('bank'),
  fdrController.verifyFdr
);

// 6. Request FDR release / refund (Institution only)
router.post(
  '/:id/release-request',
  requireRole('institution'),
  fdrController.requestRelease
);

// 7. Approve or reject release request (AICTE Admin only)
router.patch(
  '/:id/release',
  requireRole('aicte_admin'),
  fdrController.decideRelease
);

export default router;
