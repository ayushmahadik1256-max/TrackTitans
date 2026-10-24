import {
  createFdrSchema,
  bankVerifySchema,
  releaseRequestSchema,
  adminReleaseDecisionSchema,
} from '../validators/fdrValidator.js';
import fdrService from '../services/fdrService.js';
import logger from '../utils/logger.js';

/**
 * Register a new FDR record with PDF upload (Institution only)
 * Route: POST /api/fdrs
 */
export async function createFdr(req, res, next) {
  try {
    const validatedData = createFdrSchema.parse(req.body);

    const fdr = await fdrService.createFdr({
      user: req.user,
      fdrData: validatedData,
      file: req.file,
    });

    return res.status(201).json({
      success: true,
      message: 'FDR record successfully submitted and queued for bank verification.',
      data: fdr,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get FDRs scoped by caller role (Institution, Bank, AICTE Admin)
 * Route: GET /api/fdrs
 */
export async function getFdrs(req, res, next) {
  try {
    const result = await fdrService.getFdrs({
      user: req.user,
      queryParams: req.query,
    });

    return res.status(200).json({
      success: true,
      data: result.records,
      total: result.total,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get FDR details by ID
 * Route: GET /api/fdrs/:id
 */
export async function getFdrById(req, res, next) {
  try {
    const { id } = req.params;
    const fdr = await fdrService.getFdrById({ id, user: req.user });

    return res.status(200).json({
      success: true,
      data: fdr,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get pre-signed download URL for FDR document
 * Route: GET /api/fdrs/:id/document
 */
export async function getFdrDocument(req, res, next) {
  try {
    const { id } = req.params;
    const documentData = await fdrService.getFdrDocumentDownloadUrl({ id, user: req.user });

    return res.status(200).json({
      success: true,
      message: 'Temporary pre-signed download URL generated.',
      data: documentData,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Bank verification endpoint
 * Route: PATCH /api/fdrs/:id/verify
 */
export async function verifyFdr(req, res, next) {
  try {
    const { id } = req.params;
    const validatedData = bankVerifySchema.parse(req.body);

    const updatedFdr = await fdrService.verifyFdrByBank({
      id,
      bankUser: req.user,
      status: validatedData.status,
      lien_marked: validatedData.lien_marked,
      notes: validatedData.notes,
    });

    return res.status(200).json({
      success: true,
      message: `FDR verification updated to ${validatedData.status}.`,
      data: updatedFdr,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Institution requests release of FDR
 * Route: POST /api/fdrs/:id/release-request
 */
export async function requestRelease(req, res, next) {
  try {
    const { id } = req.params;
    const validatedData = releaseRequestSchema.parse(req.body);

    const updatedFdr = await fdrService.requestFdrRelease({
      id,
      institutionUser: req.user,
      notes: validatedData.notes,
    });

    return res.status(200).json({
      success: true,
      message: 'FDR release request submitted to AICTE administrators for review.',
      data: updatedFdr,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * AICTE Admin approves or rejects FDR release
 * Route: PATCH /api/fdrs/:id/release
 */
export async function decideRelease(req, res, next) {
  try {
    const { id } = req.params;
    const validatedData = adminReleaseDecisionSchema.parse(req.body);

    const updatedFdr = await fdrService.decideFdrRelease({
      id,
      adminUser: req.user,
      decision: validatedData.decision,
      notes: validatedData.notes,
    });

    return res.status(200).json({
      success: true,
      message: `Release request has been ${validatedData.decision}.`,
      data: updatedFdr,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  createFdr,
  getFdrs,
  getFdrById,
  getFdrDocument,
  verifyFdr,
  requestRelease,
  decideRelease,
};
