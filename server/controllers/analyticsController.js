import analyticsService from '../services/analyticsService.js';

/**
 * Controller for AICTE Admin Analytics and KPI Dashboard
 * Route: GET /api/analytics/summary
 */
export async function getSummary(req, res, next) {
  try {
    const summary = await analyticsService.getAdminSummary();
    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getSummary,
};
