import { getUser } from "@/lib/dal";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function AccountPage() {
  const user = await getUser();
  if (!user) return null;

  const used = Number(user.storageUsed);
  const quota = Number(user.storageQuota);
  const percent = quota > 0 ? Math.min(100, (used / quota) * 100) : 0;

  return (
    <div className="flex h-full flex-col items-center gap-4 overflow-y-auto p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Account
            <Badge variant="secondary">{user.plan}</Badge>
          </CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Storage</span>
              <span>
                {formatBytes(used)} of {formatBytes(quota)} used
              </span>
            </div>
            <Progress value={percent} />
          </div>
          <Button disabled variant="outline" className="w-full">
            Upgrade to Pro — coming soon
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
