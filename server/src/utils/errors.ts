import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details: any;

  constructor(message: string, statusCode = 500, details: any = null, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details: any = null) {
    super(message, 404, details);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details: any = null) {
    super(message, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access', details: any = null) {
    super(message, 401, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden', details: any = null) {
    super(message, 403, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details: any = null) {
    super(message, 409, details);
  }
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
