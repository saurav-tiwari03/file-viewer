"use server";

import { revalidatePath } from "next/cache";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3, S3_BUCKET } from "@/lib/s3";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/dal";

async function requireOwnedFile(fileId: string) {
  const session = await verifySession();
  const file = await prisma.file.findUnique({ where: { id: fileId } });
  if (!file || file.ownerId !== session.userId) {
    throw new Error("File not found.");
  }
  return file;
}

async function requireOwnedFolder(folderId: string) {
  const session = await verifySession();
  const folder = await prisma.folder.findUnique({ where: { id: folderId } });
  if (!folder || folder.ownerId !== session.userId) {
    throw new Error("Folder not found.");
  }
  return folder;
}

export async function toggleFavorite(fileId: string) {
  const file = await requireOwnedFile(fileId);
  await prisma.file.update({ where: { id: file.id }, data: { favorite: !file.favorite } });
  revalidatePath("/files");
  revalidatePath("/favorites");
}

export async function renameFile(fileId: string, filename: string) {
  const trimmed = filename.trim();
  if (!trimmed) throw new Error("Filename cannot be empty.");
  await requireOwnedFile(fileId);
  await prisma.file.update({ where: { id: fileId }, data: { filename: trimmed } });
  revalidatePath("/files");
}

export async function moveToTrash(fileId: string) {
  const file = await requireOwnedFile(fileId);
  await prisma.file.update({ where: { id: file.id }, data: { trashed: true, deletedAt: new Date() } });
  revalidatePath("/files");
  revalidatePath("/trash");
}

export async function restoreFromTrash(fileId: string) {
  const file = await requireOwnedFile(fileId);
  await prisma.file.update({ where: { id: file.id }, data: { trashed: false, deletedAt: null } });
  revalidatePath("/files");
  revalidatePath("/trash");
}

export async function permanentlyDeleteFile(fileId: string) {
  const session = await verifySession();
  const file = await requireOwnedFile(fileId);

  await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: file.s3Key })).catch(() => {});

  await prisma.$transaction([
    prisma.file.delete({ where: { id: file.id } }),
    prisma.user.update({ where: { id: session.userId }, data: { storageUsed: { decrement: file.size } } }),
  ]);

  revalidatePath("/files");
  revalidatePath("/trash");
}

export async function createFolder(name: string, parentId?: string | null) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Folder name cannot be empty.");
  const session = await verifySession();

  if (parentId) {
    const parent = await prisma.folder.findUnique({ where: { id: parentId } });
    if (!parent || parent.ownerId !== session.userId) throw new Error("Folder not found.");
  }

  await prisma.folder.create({ data: { name: trimmed, ownerId: session.userId, parentId: parentId ?? null } });
  revalidatePath("/files");
}

export async function moveToFolder(fileId: string, folderId: string | null) {
  const session = await verifySession();
  await requireOwnedFile(fileId);

  if (folderId) {
    const folder = await prisma.folder.findUnique({ where: { id: folderId } });
    if (!folder || folder.ownerId !== session.userId) {
      throw new Error("Folder not found.");
    }
  }

  await prisma.file.update({ where: { id: fileId }, data: { folderId } });
  revalidatePath("/files");
}

export async function moveFolder(folderId: string, parentId: string | null) {
  const session = await verifySession();
  await requireOwnedFolder(folderId);

  if (parentId) {
    if (parentId === folderId) throw new Error("Cannot move a folder into itself.");

    let cursor = await prisma.folder.findUnique({ where: { id: parentId } });
    if (!cursor || cursor.ownerId !== session.userId) throw new Error("Folder not found.");

    while (cursor) {
      if (cursor.id === folderId) throw new Error("Cannot move a folder into one of its own subfolders.");
      if (!cursor.parentId) break;
      cursor = await prisma.folder.findUnique({ where: { id: cursor.parentId } });
    }
  }

  await prisma.folder.update({ where: { id: folderId }, data: { parentId } });
  revalidatePath("/files");
}

export async function renameFolder(folderId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Folder name cannot be empty.");
  await requireOwnedFolder(folderId);
  await prisma.folder.update({ where: { id: folderId }, data: { name: trimmed } });
  revalidatePath("/files");
}

// Folders have no trash of their own — deleting one is permanent, but its
// files aren't: the schema's onDelete: SetNull unlinks them back to root
// instead of deleting them.
export async function deleteFolder(folderId: string) {
  await requireOwnedFolder(folderId);
  await prisma.folder.delete({ where: { id: folderId } });
  revalidatePath("/files");
}
