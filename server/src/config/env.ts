import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '8123', 10),
  HOST: process.env.HOST || '127.0.0.1',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/retail_db?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-production-key-retail-management-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};
