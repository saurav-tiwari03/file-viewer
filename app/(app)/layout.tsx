import { getUser } from "@/lib/dal";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { TopBar } from "@/components/app-shell/top-bar";
import type { CSSProperties } from "react";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) return null;

  return (
    <SidebarProvider style={{ "--sidebar-width": "18rem" } as CSSProperties}>
      <AppSidebar storageUsed={Number(user.storageUsed)} storageQuota={Number(user.storageQuota)} plan={user.plan} />
      <SidebarInset>
        <div className="flex h-dvh flex-col">
          <TopBar email={user.email} />
          <main className="min-h-0 flex-1">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
