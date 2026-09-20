import winston from 'winston';
import { ENV } from '../config/env.js';

export const logger = winston.createLogger({
  level: ENV.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'retail-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
          return `[${timestamp}] ${level}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ''
          } ${stack || ''}`;
        })
      ),
    }),
  ],
});
