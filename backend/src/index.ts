import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './docs/swagger.json' with { type: 'json' };

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import roleRoutes from './routes/roles.js';
import verificationRoutes from './routes/verifications.js';
import leaveRoutes from './routes/leaves.js';
import payrollRoutes from './routes/payroll.js';
import performanceRoutes from './routes/performance.js';
import assetRoutes from './routes/assets.js';
import courseRoutes from './routes/courses.js';
import enrollmentRoutes from './routes/enrollments.js';
import gradeRoutes from './routes/grades.js';
import attendanceRoutes from './routes/attendance.js';
import examRoutes from './routes/exams.js';
import invoiceRoutes from './routes/invoices.js';
import expenseRoutes from './routes/expenses.js';
import paymentRoutes from './routes/payments.js';
import campaignRoutes from './routes/campaigns.js';
import notificationRoutes from './routes/notifications.js';
import settingRoutes from './routes/settings.js';
import reportRoutes from './routes/reports.js';
import dashboardRoutes from './routes/dashboard.js';
import searchRoutes from './routes/search.js';
import analyticsRoutes from './routes/analytics.js';
import bulkRoutes from './routes/bulk.js';
import exportRoutes from './routes/export.js';
import webhookRoutes from './routes/webhooks.js';
import backupRoutes from './routes/backup.js';

// Import middleware
import { authenticateJWT } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
  });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API Routes
app.use('/api/auth', authRoutes);

// Protected routes - require authentication
app.use('/api/users', authenticateJWT, userRoutes);
app.use('/api/roles', authenticateJWT, roleRoutes);
app.use('/api/verifications', authenticateJWT, verificationRoutes);
app.use('/api/leaves', authenticateJWT, leaveRoutes);
app.use('/api/payroll', authenticateJWT, payrollRoutes);
app.use('/api/performance', authenticateJWT, performanceRoutes);
app.use('/api/assets', authenticateJWT, assetRoutes);
app.use('/api/courses', authenticateJWT, courseRoutes);
app.use('/api/enrollments', authenticateJWT, enrollmentRoutes);
app.use('/api/grades', authenticateJWT, gradeRoutes);
app.use('/api/attendance', authenticateJWT, attendanceRoutes);
app.use('/api/exams', authenticateJWT, examRoutes);
app.use('/api/invoices', authenticateJWT, invoiceRoutes);
app.use('/api/payments', authenticateJWT, paymentRoutes);
app.use('/api/expenses', authenticateJWT, expenseRoutes);
app.use('/api/campaigns', authenticateJWT, campaignRoutes);
app.use('/api/notifications', authenticateJWT, notificationRoutes);
app.use('/api/settings', authenticateJWT, settingRoutes);
app.use('/api/reports', authenticateJWT, reportRoutes);
app.use('/api/dashboard', authenticateJWT, dashboardRoutes);
app.use('/api/search', authenticateJWT, searchRoutes);
app.use('/api/analytics', authenticateJWT, analyticsRoutes);
app.use('/api/bulk', authenticateJWT, bulkRoutes);
app.use('/api/export', authenticateJWT, exportRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/backup', authenticateJWT, backupRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Global error handler
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', error);

  // Prisma errors
  if (error.code === 'P2002') {
    return res.status(400).json({
      error: 'Duplicate entry',
      message: 'A record with this information already exists',
    });
  }

  if (error.code === 'P2025') {
    return res.status(404).json({
      error: 'Record not found',
      message: 'The requested record does not exist',
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'The provided token is invalid',
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      message: 'The provided token has expired',
    });
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: error.message,
    });
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

export default app;

