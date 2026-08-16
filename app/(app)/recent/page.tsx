import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { toFileListItem } from "@/lib/files";
import { FileGrid } from "@/components/file-list/file-grid";

export default async function RecentPage() {
  const session = await verifySession();
  const files = await prisma.file.findMany({
    where: { ownerId: session.userId, trashed: false },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  return (
    <div className="h-full overflow-y-auto">
      <FileGrid files={files.map(toFileListItem)} emptyMessage="No recent files." />
    </div>
  );
}
