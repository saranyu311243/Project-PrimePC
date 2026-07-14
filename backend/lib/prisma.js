const { PrismaClient } = require('@prisma/client');

// Production: log only warnings/errors. Dev: verbose query logging.
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'production'
    ? ['warn', 'error']
    : ['query', 'info', 'warn', 'error'],
});

module.exports = prisma;
