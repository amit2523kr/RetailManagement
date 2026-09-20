import { app } from './app.js';
import { ENV } from './config/env.js';
import { logger } from './utils/logger.js';
import { prisma } from './db/prisma.js';

const server = app.listen(ENV.PORT, ENV.HOST, () => {
  logger.info(`🚀 Retail Management Platform API Server running at http://${ENV.HOST}:${ENV.PORT}`);
  logger.info(`Environment: ${ENV.NODE_ENV}`);
});

// Graceful Shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    logger.info('HTTP Server closed.');
    await prisma.$disconnect();
    logger.info('Database disconnected. Process exit 0.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
