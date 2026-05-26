const app = require('./app');
const config = require('./config');
const logger = require('./config/logger');
const { getDatabase } = require('./config/database');

// Initialize database
getDatabase();

// Start server
const server = app.listen(config.port, () => {
  logger.info(`Store Management System running on http://localhost:${config.port}`);
  logger.info(`Environment: ${config.env}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  server.close(() => process.exit(0));
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection:', err);
});

module.exports = server;
