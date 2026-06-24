import { BarChart3, BellRing, ShieldCheck, Sparkles, SwatchBook, Workflow } from "lucide-react";

import { PageHeading } from "@/components/shared/page-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Profile"
        title="Your workspace profile"
        description="Manage your review identity, preferred workflow, and the way ClawCheck feels in day-to-day use."
      />

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="section-panel">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Primary reviewer details for this evaluation workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-foreground text-xl font-semibold text-background shadow-sm">
                A
              </div>
              <div>
                <p className="text-lg font-semibold">Asad</p>
                <p className="text-sm text-muted-foreground">Lead evaluator</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-full border-border bg-background/70">
                Safety reviewer
              </Badge>
              <Badge variant="outline" className="rounded-full border-border bg-background/70">
                Dashboard owner
              </Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="subtle-panel p-4">
                <p className="text-sm font-medium">Workspace role</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Reviews risky agent outputs and shares structured reports.
                </p>
              </div>
              <div className="subtle-panel p-4">
                <p className="text-sm font-medium">Preferred workflow</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Prompt library, fast paste-in reviews, polished report export.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="surface-card p-4">
                <p className="text-2xl font-semibold tracking-tight">32</p>
                <p className="mt-1 text-sm text-muted-foreground">Reports reviewed</p>
              </div>
              <div className="surface-card p-4">
                <p className="text-2xl font-semibold tracking-tight">82</p>
                <p className="mt-1 text-sm text-muted-foreground">Average score seen</p>
              </div>
              <div className="surface-card p-4">
                <p className="text-2xl font-semibold tracking-tight">4</p>
                <p className="mt-1 text-sm text-muted-foreground">Active categories</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-card">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Current UI and workflow settings for the demo environment.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="subtle-panel space-y-3 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <SwatchBook className="size-4 text-primary" />
                Theme
              </div>
              <p className="text-sm text-muted-foreground">
                Light-first SaaS styling with a tuned dark mode for demos and screenshots.
              </p>
            </div>
            <div className="subtle-panel space-y-3 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <BellRing className="size-4 text-primary" />
                Notifications
              </div>
              <p className="text-sm text-muted-foreground">
                Clean toast feedback with readable status messaging and subtle emphasis.
              </p>
            </div>
            <div className="subtle-panel space-y-3 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="size-4 text-primary" />
                Visual motion
              </div>
              <p className="text-sm text-muted-foreground">
                Lightweight landing-page motion only, so the product UI stays fast and focused.
              </p>
            </div>
            <div className="subtle-panel space-y-3 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Workflow className="size-4 text-primary" />
                Flow
              </div>
              <p className="text-sm text-muted-foreground">
                Step-based evaluations, searchable test cases, and report-first analysis.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr_1fr]">
        <Card className="surface-card">
          <CardContent className="space-y-3 p-6">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="size-4 text-emerald-500" />
              Review quality
            </div>
            <p className="text-3xl font-semibold tracking-tight">Consistent</p>
            <p className="text-sm leading-6 text-muted-foreground">
              Uses rubric-driven checks across privacy, fairness, stakeholder harm, and misuse risk.
            </p>
          </CardContent>
        </Card>
        <Card className="surface-card">
          <CardContent className="space-y-3 p-6">
            <div className="flex items-center gap-2 text-sm font-medium">
              <BarChart3 className="size-4 text-primary" />
              Reporting style
            </div>
            <p className="text-3xl font-semibold tracking-tight">Executive-ready</p>
            <p className="text-sm leading-6 text-muted-foreground">
              Prioritizes compact summaries, color-coded risk levels, and confidence signals.
            </p>
          </CardContent>
        </Card>
        <Card className="surface-card">
          <CardContent className="space-y-3 p-6">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="size-4 text-amber-500" />
              Demo mode
            </div>
            <p className="text-3xl font-semibold tracking-tight">Ready</p>
            <p className="text-sm leading-6 text-muted-foreground">
              Optimized for hackathon walkthroughs, GitHub showcases, and product landing demos.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
