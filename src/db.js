// 1. Importers/Callers: server.js, src/services/wmsService.js, prisma seed
// 2. Affected API: Prisma Client Database Connection Singleton
// 3. Data Schemas: PrismaClient instance for Supabase PostgreSQL
// 4. User's Verbatim Instruction: "check lại logic cốt lõi cấm đươc fake dự liệu phải thật nghiệm ngặt về luồng dữ liệu và logic code và dữ liệu sẽ lưu trên database" and "dùng data base trên supabase"

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

module.exports = prisma;
