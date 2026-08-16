import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { toFileListItem } from "@/lib/files";
import { ComputerFileManager } from "@/components/file-list/computer-file-manager";

export default async function FilesPage() {
  const session = await verifySession();
  const files = await prisma.file.findMany({
    where: { ownerId: session.userId, trashed: false, folderId: null },
    orderBy: { createdAt: "desc" },
  });

  const folders = await prisma.folder.findMany({
    where: { ownerId: session.userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, createdAt: true, _count: { select: { files: true } } },
  });
  const folderItems = folders.map((folder) => ({
    id: folder.id,
    name: folder.name,
    createdAt: folder.createdAt.toISOString(),
    fileCount: folder._count.files,
  }));

  return (
    <ComputerFileManager files={files.map(toFileListItem)} folders={folderItems} allFolders={folderItems} />
  );
}
