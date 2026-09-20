import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ENV } from './config/env.js';
import { globalErrorHandler } from './middleware/errorHandler.js';
import { authRouter } from './modules/auth/auth.router.js';
import { sendSuccess } from './utils/response.js';
import { NotFoundError } from './utils/errors.js';

export const app = express();

// Security & Standard Middleware
app.use(helmet());
app.use(cors({ origin: ENV.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (ENV.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health & Readiness Observability Probes
app.get('/health', (req, res) => {
  return sendSuccess(res, { status: 'UP', timestamp: new Date().toISOString() }, 'Health probe OK');
});

app.get('/ready', (req, res) => {
  return sendSuccess(res, { status: 'READY', uptime: process.uptime() }, 'Readiness probe OK');
});

// API V1 Routes
app.use('/api/v1/auth', authRouter);

// 404 Handler
app.use('*', (req, res, next) => {
  next(new NotFoundError(`Cannot find route ${req.originalUrl} on this server`));
});

// Global Centralized Error Handling Middleware
app.use(globalErrorHandler);
