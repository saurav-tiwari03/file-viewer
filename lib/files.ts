import "server-only";
import { prisma } from "@/lib/db";
import { getAnonymousSessionId } from "@/lib/anon-session";
import { getSession } from "@/lib/session";
import { ANONYMOUS_FILE_TTL_MS } from "@/lib/definitions";
import type { File } from "@/lib/generated/prisma/client";

export function toFileListItem(file: File) {
  return {
    id: file.id,
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size.toString(),
    favorite: file.favorite,
    trashed: file.trashed,
    folderId: file.folderId,
    createdAt: file.createdAt.toISOString(),
    updatedAt: file.updatedAt.toISOString(),
  };
}

/**
 * Resolves a File row the current request is allowed to access. For anonymous
 * files this refreshes the TTL on access so an actively-viewed file survives
 * the session. Returns null if the file doesn't exist or the caller doesn't own it.
 */
export async function getAccessibleFile(fileId: string) {
  const file = await prisma.file.findUnique({ where: { id: fileId } });
  if (!file || file.trashed) return null;

  if (file.ownerId) {
    const session = await getSession();
    if (!session || session.userId !== file.ownerId) return null;
    return file;
  }

  if (file.anonymousSessionId) {
    const sessionId = await getAnonymousSessionId();
    if (!sessionId || sessionId !== file.anonymousSessionId) return null;
    if (file.expiresAt && file.expiresAt.getTime() < Date.now()) return null;

    const refreshed = await prisma.file.update({
      where: { id: file.id },
      data: { expiresAt: new Date(Date.now() + ANONYMOUS_FILE_TTL_MS) },
    });
    return refreshed;
  }

  return null;
}

/**
 * TODO: once anonymous → registered account reconciliation is built, this is
 * where anonymous files get re-parented to the new user and moved in S3
 * (File-Viewer/Temp/{sessionId}/... -> File-Viewer/Perm/{userName}-{userId}/...).
 * Not wired in yet.
 */
export async function reconcileAnonymousFiles(userId: string, anonymousSessionId: string) {
  void userId;
  void anonymousSessionId;
  return;
}
