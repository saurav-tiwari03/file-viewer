"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Files, Clock, Star, Users, Trash2, Monitor, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { StorageMeter } from "./storage-meter";
import { UploadDialog } from "./upload-dialog";

const NAV_ITEMS = [
  { href: "/files", label: "All Files", icon: Files },
  { href: "/recent", label: "Recent", icon: Clock },
  { href: "/favorites", label: "Favorites", icon: Star },
  { href: "/trash", label: "Trash", icon: Trash2 },
];

export function AppSidebar({
  storageUsed,
  storageQuota,
  plan,
}: {
  storageUsed: number;
  storageQuota: number;
  plan: string;
}) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-sidebar-border">
      <SidebarHeader className="h-18 justify-center border-b px-5 py-0">
        <Link href="/files" className="py-1.5">
          <Logo size={24} />
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-3 pt-4">
        <SidebarGroup className="p-0 pb-4">
          <SidebarGroupContent>
            <UploadDialog />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-2 text-[11px] font-semibold uppercase tracking-wider">Quick access</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton className="hover:bg-primary/10 hover:text-primary" isActive={pathname.startsWith(item.href)} render={<Link href={item.href} />}>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton className="hover:bg-primary/10 hover:text-primary" tooltip="Sharing isn't available yet" onClick={(event) => event.preventDefault()}>
                  <Users />
                  <span>Shared with me</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-4 border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:bg-primary/10 hover:text-primary" isActive={pathname.startsWith("/settings")} render={<Link href="/settings" />}>
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div>
          <div className="flex items-center gap-2 px-1 mb-2 text-xs font-medium text-muted-foreground">
            <Monitor className="size-3.5" /> Your Storage
          </div>
          <StorageMeter used={storageUsed} quota={storageQuota} />
          <Button disabled variant="outline" size="sm" className="mt-1 w-full">
            {plan === "FREE" ? "Upgrade" : "Pro plan"}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
