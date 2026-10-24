import { z } from 'zod';

/**
 * Validator for User Sync upon Firebase login
 */
export const syncUserSchema = z.object({
  role: z.enum(['institution', 'bank', 'aicte_admin']),
  full_name: z.string().min(2, 'Full name must have at least 2 characters').max(255),
  institution_name: z.string().max(255).optional().nullable(),
  aicte_application_id: z.string().max(100).optional().nullable(),
  bank_name: z.string().max(255).optional().nullable(),
  branch_name: z.string().max(255).optional().nullable(),
  ifsc_code: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format (e.g. SBIN0000691)').optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  phone: z.string().max(32).optional().nullable(),
});

/**
 * Validator for FDR Registration / Submission
 */
export const createFdrSchema = z.object({
  fdr_number: z.string().min(3, 'FDR number must be at least 3 characters').max(100),
  deposit_amount: z.coerce.number().positive('Deposit amount must be greater than 0'),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Issue date must be in YYYY-MM-DD format'),
  maturity_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Maturity date must be in YYYY-MM-DD format'),
  bank_name: z.string().min(2, 'Bank name is required').max(255),
  branch_name: z.string().max(255).optional().nullable(),
  ifsc_code: z.string().max(32).optional().nullable(),
  remarks: z.string().max(1000).optional().nullable(),
}).refine((data) => new Date(data.maturity_date) > new Date(data.issue_date), {
  message: 'Maturity date must be chronologically after the issue date',
  path: ['maturity_date'],
});

/**
 * Validator for Bank Verification
 */
export const bankVerifySchema = z.object({
  status: z.enum(['bank_verified', 'rejected'], {
    errorMap: () => ({ message: "Status must be either 'bank_verified' or 'rejected'" }),
  }),
  lien_marked: z.boolean().default(false),
  notes: z.string().max(1000).optional().nullable(),
});

/**
 * Validator for Institution Release Request
 */
export const releaseRequestSchema = z.object({
  notes: z.string().min(5, 'Please provide detailed justification for release request').max(1000),
});

/**
 * Validator for AICTE Admin Release Decision
 */
export const adminReleaseDecisionSchema = z.object({
  decision: z.enum(['approved', 'rejected'], {
    errorMap: () => ({ message: "Decision must be either 'approved' or 'rejected'" }),
  }),
  notes: z.string().min(3, 'Admin notes are required for FDR release decision').max(1000),
});

export default {
  syncUserSchema,
  createFdrSchema,
  bankVerifySchema,
  releaseRequestSchema,
  adminReleaseDecisionSchema,
};
