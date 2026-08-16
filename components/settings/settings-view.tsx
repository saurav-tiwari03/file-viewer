"use client";

import { useActionState } from "react";
import { Settings2, Palette, Eye, Shield, Bell, Database, Keyboard, Info } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useTheme } from "@/components/theme-provider";
import { logoutAction, updateNameAction } from "@/lib/actions/auth";
import { Logo } from "@/components/logo";

const SECTIONS = [
  { value: "general", label: "General", icon: Settings2 },
  { value: "appearance", label: "Appearance", icon: Palette },
  { value: "viewer", label: "Viewer Preferences", icon: Eye },
  { value: "security", label: "Security & Privacy", icon: Shield },
  { value: "notifications", label: "Notifications", icon: Bell },
  { value: "storage", label: "Storage", icon: Database },
  { value: "shortcuts", label: "Shortcuts", icon: Keyboard },
  { value: "about", label: "About", icon: Info },
];

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SettingsView({
  email,
  name,
  plan,
  storageUsed,
  storageQuota,
}: {
  email: string;
  name: string | null;
  plan: string;
  storageUsed: number;
  storageQuota: number;
}) {
  const { theme, setTheme } = useTheme();
  const percent = storageQuota > 0 ? Math.min(100, (storageUsed / storageQuota) * 100) : 0;
  const [nameState, updateName, updateNamePending] = useActionState(updateNameAction, undefined);
  const isMobile = useIsMobile();

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your preferences and account settings</p>
        </div>

        <Tabs defaultValue="general" orientation={isMobile ? "horizontal" : "vertical"} className="flex-col items-stretch gap-4 md:flex-row md:items-start md:gap-6">
          <TabsList
            variant="line"
            className="flex w-full items-stretch gap-0.5 overflow-x-auto bg-transparent p-0 md:w-52 md:shrink-0 md:flex-col md:overflow-visible"
          >
            {SECTIONS.map((section) => (
              <TabsTrigger key={section.value} value={section.value} className="shrink-0 cursor-pointer justify-start gap-2 px-2.5 py-1.5 whitespace-nowrap data-active:text-primary after:bg-primary">
                <section.icon />
                <span>{section.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="min-w-0 flex-1 space-y-4">
            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                  <CardDescription>Manage your account and session</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  <form action={updateName} className="flex flex-wrap items-end gap-3">
                    <div className="flex min-w-48 flex-1 flex-col gap-2">
                      <Label htmlFor="name">Full name</Label>
                      <Input id="name" name="name" defaultValue={name ?? ""} placeholder="Enter your full name" maxLength={100} />
                    </div>
                    <Button type="submit" variant="outline" size="sm" disabled={updateNamePending}>
                      {updateNamePending ? "Saving…" : nameState?.success ? "Saved" : "Save"}
                    </Button>
                  </form>
                  {nameState?.error && <p className="text-sm text-destructive">{nameState.error}</p>}

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                    <div>
                      <p className="text-sm font-medium">{email}</p>
                      <p className="text-xs text-muted-foreground">Signed in via email code</p>
                    </div>
                    <form action={logoutAction}>
                      <Button type="submit" variant="outline" size="sm">Sign out</Button>
                    </form>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="divide-y">
                  <SettingRow title="Language" description="Choose your preferred language">
                    <Badge variant="secondary">English</Badge>
                  </SettingRow>
                  <SettingRow title="Date & Time Format" description="Choose how dates and times are displayed">
                    <Badge variant="secondary">24-hour (HH:mm)</Badge>
                  </SettingRow>
                  <SettingRow title="Default Landing Page" description="Choose your default page on app launch">
                    <Badge variant="secondary">All Files</Badge>
                  </SettingRow>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Select your preferred theme</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {(["light", "dark", "system"] as const).map((option) => (
                      <Button
                        key={option}
                        type="button"
                        variant={theme === option ? "default" : "outline"}
                        className="capitalize"
                        onClick={() => setTheme(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="viewer">
              <Card>
                <CardHeader>
                  <CardTitle>File Viewer Preferences</CardTitle>
                </CardHeader>
                <CardContent className="divide-y">
                  <SettingRow title="Enable Line Wrapping" description="Wrap long lines in code and text files">
                    <Switch defaultChecked disabled />
                  </SettingRow>
                  <SettingRow title="Show Line Numbers" description="Show line numbers in code files">
                    <Switch defaultChecked disabled />
                  </SettingRow>
                  <SettingRow title="Default Zoom" description="Set default zoom level for documents">
                    <Badge variant="secondary">100%</Badge>
                  </SettingRow>
                  <SettingRow title="Remember Last Position" description="Restore last scroll position when reopening files">
                    <Switch defaultChecked disabled />
                  </SettingRow>
                </CardContent>
              </Card>
              <p className="mt-2 text-xs text-muted-foreground">These preferences aren&apos;t configurable yet — coming soon.</p>
            </TabsContent>

            <TabsContent value="security">
              <EmptySection title="Security & Privacy" description="Security and privacy controls aren't available yet." />
            </TabsContent>
            <TabsContent value="notifications">
              <EmptySection title="Notifications" description="Notification preferences aren't available yet." />
            </TabsContent>
            <TabsContent value="storage">
              <Card>
                <CardHeader>
                  <CardTitle>Storage</CardTitle>
                  <CardDescription>{formatBytes(storageUsed)} of {formatBytes(storageQuota)} used</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <Progress value={percent} />
                  <Button disabled variant="outline" className="w-full">
                    {plan === "FREE" ? "Upgrade for more storage" : "Pro plan"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="shortcuts">
              <EmptySection title="Shortcuts" description="Keyboard shortcut customization isn't available yet." />
            </TabsContent>

            <TabsContent value="about">
              <Card>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
                  <div className="flex items-center gap-3">
                    <Logo size={28} />
                    <div>
                      <p className="text-sm font-semibold">FileViewer v1.0.0</p>
                      <p className="text-xs text-muted-foreground">View any file. Instantly.</p>
                    </div>
                  </div>
                  <Button disabled variant="outline" size="sm">Check for Updates</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function SettingRow({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

function EmptySection({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
