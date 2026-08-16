import { getUser } from "@/lib/dal";
import { SettingsView } from "@/components/settings/settings-view";

export default async function SettingsPage() {
  const user = await getUser();
  if (!user) return null;

  return (
    <SettingsView
      email={user.email}
      plan={user.plan}
      storageUsed={Number(user.storageUsed)}
      storageQuota={Number(user.storageQuota)}
    />
  );
}
