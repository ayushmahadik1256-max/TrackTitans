import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import fdrRoutes from './routes/fdrRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import { authenticate } from './middleware/auth.js';
import { requireRole } from './middleware/requireRole.js';
import { startMaturityAlertJob, runMaturityCheck } from './jobs/maturityAlertJob.js';
import logger from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. CORS Configuration
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 2. HTTP Request Logging with Morgan
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// 3. Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TrackTitans SIH26265 API is healthy and operational.',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'TrackTitans-Backend',
  });
});

// 5. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/fdrs', fdrRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// 6. Manual trigger for testing maturity cron job (AICTE Admin or dev)
app.post(
  '/api/jobs/trigger-maturity-check',
  authenticate,
  requireRole('aicte_admin'),
  async (req, res, next) => {
    try {
      const results = await runMaturityCheck();
      res.status(200).json({
        success: true,
        message: 'Maturity check job executed manually.',
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
);

// 7. 404 Route Catch-All
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' does not exist on TrackTitans server.`,
    errors: ['Resource not found'],
  });
});

// 8. Centralized Error Handler
app.use(errorHandler);

// 9. Start Server and Cron Job
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`TrackTitans backend server running on port ${PORT}`);
    // Register the 9:00 AM IST maturity alert scheduled job
    startMaturityAlertJob();
  });
}

export default app;
