import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { toFileListItem } from "@/lib/files";
import { ComputerFileManager } from "@/components/file-list/computer-file-manager";

export default async function FolderPage({ params }: { params: Promise<{ folderId: string }> }) {
  const { folderId } = await params;
  const session = await verifySession();

  const folder = await prisma.folder.findUnique({ where: { id: folderId } });
  if (!folder || folder.ownerId !== session.userId) notFound();

  const files = await prisma.file.findMany({
    where: { ownerId: session.userId, trashed: false, folderId },
    orderBy: { createdAt: "desc" },
  });

  const childFolders = await prisma.folder.findMany({
    where: { ownerId: session.userId, parentId: folderId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, parentId: true, createdAt: true, _count: { select: { files: true } } },
  });
  const allFolders = await prisma.folder.findMany({
    where: { ownerId: session.userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, parentId: true, createdAt: true, _count: { select: { files: true } } },
  });
  const toItem = (f: (typeof allFolders)[number]) => ({
    id: f.id,
    name: f.name,
    parentId: f.parentId,
    createdAt: f.createdAt.toISOString(),
    fileCount: f._count.files,
  });

  const ancestors: { id: string; name: string }[] = [];
  let cursor = folder.parentId ? await prisma.folder.findUnique({ where: { id: folder.parentId } }) : null;
  while (cursor && cursor.ownerId === session.userId) {
    ancestors.unshift({ id: cursor.id, name: cursor.name });
    cursor = cursor.parentId ? await prisma.folder.findUnique({ where: { id: cursor.parentId } }) : null;
  }

  return (
    <ComputerFileManager
      files={files.map(toFileListItem)}
      folders={childFolders.map(toItem)}
      allFolders={allFolders.map(toItem)}
      currentFolder={{ id: folder.id, name: folder.name, parentId: folder.parentId }}
      ancestors={ancestors}
    />
  );
}
