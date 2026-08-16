import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { toFileListItem } from "@/lib/files";
import { FileGrid } from "@/components/file-list/file-grid";

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
    <div className="h-full overflow-y-auto">
      <h1 className="px-4 pt-4 text-sm font-semibold">{folder.name}</h1>
      <FileGrid files={files.map(toFileListItem)} emptyMessage="This folder is empty." />
    </div>
  );
}
