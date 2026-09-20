import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
  errors?: any;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Operation successful',
  statusCode = 200,
  meta?: ApiResponse['meta']
): Response {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta,
  };
  return res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  message = 'An error occurred',
  statusCode = 500,
  errors: any = null
): Response {
  const response: ApiResponse = {
    success: false,
    message,
    errors,
  };
  return res.status(statusCode).json(response);
}
