// 1. Importers/Callers: server.js, src/services/wmsService.js, prisma seed
// 2. Affected API: Prisma Client Database Connection Singleton for Serverless & Long-running Node
// 3. Data Schemas: PrismaClient instance for Supabase PostgreSQL
// 4. User's Verbatim Instruction: "FATAL: (EMAXCONNSESSION) max clients reached in session mode - max clients are limited to pool_size: 15"

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

globalForPrisma.prisma = prisma;

module.exports = prisma;
