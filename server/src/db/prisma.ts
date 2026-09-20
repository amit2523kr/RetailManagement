import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'info' },
    { emit: 'stdout', level: 'warn' },
  ],
});

// Log slow queries in development / debug mode
if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  prisma.$on('query', (e: any) => {
    if (e.duration > 100) {
      logger.warn(`Slow Query [${e.duration}ms]: ${e.query}`);
    }
  });
}
