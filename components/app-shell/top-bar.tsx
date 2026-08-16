"use client";

import { Search, HelpCircle, Bell, ChevronLeft, ChevronRight, Grid2X2, Settings } from "lucide-react";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/lib/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";

export function TopBar({ email }: { email: string }) {
  return (
    <header className="flex h-16 items-center gap-2 border-b bg-card px-3 sm:h-18 sm:px-5">
      <SidebarTrigger />
      <div className="hidden items-center gap-1 border-r pr-3 sm:flex">
        <Button variant="ghost" size="icon-sm" disabled aria-label="Back"><ChevronLeft className="size-4" /></Button>
        <Button variant="ghost" size="icon-sm" disabled aria-label="Forward"><ChevronRight className="size-4" /></Button>
      </div>
      <div className="relative w-full min-w-0 max-w-md">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search this computer" className="h-9 rounded-md border-border bg-muted/40 pl-10 shadow-none" disabled />
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" disabled title="View options" className="hidden sm:inline-flex"><Grid2X2 className="size-4" /></Button>
        <ThemeToggle />
        <Button variant="ghost" size="icon" disabled title="Help" className="hidden sm:inline-flex">
          <HelpCircle className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" disabled title="Notifications" className="hidden sm:inline-flex">
          <Bell className="size-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="h-10 gap-2 rounded-full px-1.5 pr-2" />}>
            <Avatar className="size-8 bg-primary text-primary-foreground">
              <AvatarFallback>{email.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="hidden max-w-32 truncate text-sm font-medium sm:inline-block">{email.split("@")[0]}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="max-w-48 truncate font-normal text-muted-foreground">
              {email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/settings" />}>
              <Settings />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              render={
                <form action={logoutAction} className="w-full">
                  <button type="submit" className="w-full text-left">
                    Log out
                  </button>
                </form>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
