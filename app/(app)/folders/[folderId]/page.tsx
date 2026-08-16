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

  return (
    <ComputerFileManager
      files={files.map(toFileListItem)}
      folders={[]}
      currentFolder={{ id: folder.id, name: folder.name }}
    />
  );
}
