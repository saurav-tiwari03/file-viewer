import "server-only";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
  var __pgPool: Pool | undefined;
}

const pool = globalThis.__pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma = globalThis.__prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
  globalThis.__pgPool = pool;
}
