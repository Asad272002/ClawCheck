import { BriefcaseBusiness, FileCheck2, ShieldCheck, Sparkles } from "lucide-react";

import { ProfileSettingsForm } from "@/components/profile/profile-settings-form";
import { PageHeading } from "@/components/shared/page-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCurrentUser } from "@/lib/auth/user";
import { getReports } from "@/lib/db/reports";
import { fetchWorkspaces } from "@/lib/db/workspaces";

function formatProviderLabel(provider: string) {
  if (provider === "google") {
    return "Google SSO";
  }

  if (provider === "email") {
    return "Email login";
  }

  return provider.replace(/_/g, " ");
}

export default async function ProfilePage() {
  const currentUser = await requireCurrentUser();
  const [workspaces, reports] = await Promise.all([fetchWorkspaces(), getReports()]);
  const averageScore =
    reports.length > 0 ? Math.round(reports.reduce((total, report) => total + report.finalScore, 0) / reports.length) : 0;
  const authProviders = currentUser.providers.length > 0 ? currentUser.providers : ["email"];
  const roleBadges = [
    "Safety reviewer",
    workspaces.length > 0 ? "Workspace member" : "New account",
    reports.length > 0 ? "Report author" : "Ready for first review",
  ];

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Profile"
        title="Your account"
        description="Keep your photo and workspace identity up to date."
      />

      <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <Card className="section-panel">
          <CardHeader className="pb-2">
            <CardTitle>Workspace identity</CardTitle>
            <CardDescription>Shown in account menus, review spaces, and reports.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4 rounded-[1.75rem] border border-border/70 bg-background/70 p-4">
              {currentUser.avatarUrl ? (
                <div
                  aria-label={`${currentUser.name} avatar`}
                  role="img"
                  className="size-20 rounded-3xl border border-border/70 bg-cover bg-center shadow-sm"
                  style={{ backgroundImage: `url("${currentUser.avatarUrl}")` }}
                />
              ) : (
                <div className="flex size-20 items-center justify-center rounded-3xl bg-foreground text-2xl font-semibold text-background shadow-sm">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-xl font-semibold">{currentUser.name}</p>
                <p className="truncate text-sm text-muted-foreground">{currentUser.email}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {roleBadges.map((role) => (
                    <Badge key={role} variant="outline" className="rounded-full border-border bg-background/70">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="surface-card rounded-[1.5rem] p-4">
                <p className="text-2xl font-semibold tracking-tight">{reports.length}</p>
                <p className="mt-1 text-sm text-muted-foreground">Reports</p>
              </div>
              <div className="surface-card rounded-[1.5rem] p-4">
                <p className="text-2xl font-semibold tracking-tight">{averageScore}</p>
                <p className="mt-1 text-sm text-muted-foreground">Average score</p>
              </div>
              <div className="surface-card rounded-[1.5rem] p-4">
                <p className="text-2xl font-semibold tracking-tight">{workspaces.length}</p>
                <p className="mt-1 text-sm text-muted-foreground">Workspaces</p>
              </div>
            </div>

            <div className="space-y-3 rounded-[1.5rem] border border-border/70 bg-background/70 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ShieldCheck className="size-4 text-emerald-500" />
                Roles
              </div>
              <div className="flex flex-wrap gap-2">
                {roleBadges.map((role) => (
                  <Badge key={role} variant="outline" className="rounded-full border-border bg-background/70">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3 rounded-[1.5rem] border border-border/70 bg-background/70 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="size-4 text-primary" />
                Sign-in methods
              </div>
              <div className="flex flex-wrap gap-2">
                {authProviders.map((provider) => (
                  <Badge key={provider} variant="outline" className="rounded-full border-border bg-background/70 capitalize">
                    {formatProviderLabel(provider)}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3 rounded-[1.5rem] border border-border/70 bg-background/70 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <BriefcaseBusiness className="size-4 text-primary" />
                Workspace status
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="rounded-full border-border bg-background/70">
                  {workspaces.length} linked workspace{workspaces.length === 1 ? "" : "s"}
                </Badge>
                <Badge variant="outline" className="rounded-full border-border bg-background/70">
                  {reports.length} saved report{reports.length === 1 ? "" : "s"}
                </Badge>
              </div>
            </div>

            <div className="space-y-3 rounded-[1.5rem] border border-border/70 bg-background/70 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileCheck2 className="size-4 text-primary" />
                Profile state
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="rounded-full border-border bg-background/70">
                  Avatar ready
                </Badge>
                <Badge variant="outline" className="rounded-full border-border bg-background/70">
                  Synced to database
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <ProfileSettingsForm currentUser={currentUser} />
      </div>
    </div>
  );
}
