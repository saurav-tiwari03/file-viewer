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

  const allFolders = await prisma.folder.findMany({
    where: { ownerId: session.userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, createdAt: true, _count: { select: { files: true } } },
  });

  return (
    <ComputerFileManager
      files={files.map(toFileListItem)}
      folders={[]}
      allFolders={allFolders.map((f) => ({
        id: f.id,
        name: f.name,
        createdAt: f.createdAt.toISOString(),
        fileCount: f._count.files,
      }))}
      currentFolder={{ id: folder.id, name: folder.name }}
    />
  );
}
