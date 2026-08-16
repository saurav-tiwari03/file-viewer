import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { toFileListItem } from "@/lib/files";
import { FileGrid } from "@/components/file-list/file-grid";

export default async function TrashPage() {
  const session = await verifySession();
  const files = await prisma.file.findMany({
    where: { ownerId: session.userId, trashed: true },
    orderBy: { deletedAt: "desc" },
  });

  return (
    <div className="h-full overflow-y-auto">
      <p className="px-4 pt-4 text-xs text-muted-foreground">
        Trashed files still count against your storage quota until permanently deleted.
      </p>
      <FileGrid files={files.map(toFileListItem)} emptyMessage="Trash is empty." />
    </div>
  );
}
