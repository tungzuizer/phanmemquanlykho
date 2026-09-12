// 1. Importers/Callers: server.js, src/services/wmsService.js, prisma seed
// 2. Affected API: Prisma Client Database Connection Singleton for Serverless & Long-running Node
// 3. Data Schemas: PrismaClient instance for Supabase PostgreSQL
// 4. User's Verbatim Instruction: "FATAL: (EMAXCONNSESSION) max clients reached in session mode - max clients are limited to pool_size: 15"

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

// Tối ưu hóa Connection Pool cho Supabase Transaction Pooler (Port 6543)
let dbUrl = process.env.DATABASE_URL || '';
if (dbUrl && !dbUrl.includes('connection_limit')) {
  dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'connection_limit=10&pool_timeout=30';
  process.env.DATABASE_URL = dbUrl;
}

const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

globalForPrisma.prisma = prisma;

module.exports = prisma;
