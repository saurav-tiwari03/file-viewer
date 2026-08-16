import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { toFileListItem } from "@/lib/files";
import { FileGrid } from "@/components/file-list/file-grid";

export default async function FavoritesPage() {
  const session = await verifySession();
  const files = await prisma.file.findMany({
    where: { ownerId: session.userId, trashed: false, favorite: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="h-full overflow-y-auto">
      <FileGrid files={files.map(toFileListItem)} emptyMessage="No favorites yet." />
    </div>
  );
}
