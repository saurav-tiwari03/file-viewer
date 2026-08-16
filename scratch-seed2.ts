import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./lib/generated/prisma/client";
import { SignJWT } from "jose";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const email = `test-mobile-${Date.now()}@example.com`;
  const user = await prisma.user.create({ data: { email } });
  await prisma.folder.create({ data: { name: "Hall", ownerId: user.id } });
  await prisma.folder.create({ data: { name: "Project", ownerId: user.id } });

  const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
  const token = await new SignJWT({ userId: user.id, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000))
    .sign(secret);

  console.log(JSON.stringify({ token }));
  await prisma.$disconnect();
  await pool.end();
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
