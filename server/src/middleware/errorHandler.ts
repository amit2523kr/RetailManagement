import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export const globalErrorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.warn(`Operational Error [${err.statusCode}]: ${err.message}`, {
      path: req.path,
      method: req.method,
      details: err.details,
    });
    return sendError(res, err.message, err.statusCode, err.details);
  }

  // Handle unexpected non-operational errors
  logger.error(`Unhandled Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  return sendError(
    res,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    500
  );
};
