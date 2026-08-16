import { Progress } from "@/components/ui/progress";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function StorageMeter({ used, quota }: { used: number; quota: number }) {
  const percent = quota > 0 ? Math.min(100, (used / quota) * 100) : 0;

  return (
    <div className="flex flex-col gap-1.5 px-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Storage</span>
        <span>
          {formatBytes(used)} / {formatBytes(quota)}
        </span>
      </div>
      <Progress value={percent} className="h-1.5" />
    </div>
  );
}
