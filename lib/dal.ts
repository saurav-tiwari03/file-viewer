import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export const verifySession = cache(async () => {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
});

export const getUser = cache(async () => {
  const session = await verifySession();
  return prisma.user.findUnique({ where: { id: session.userId } });
});
