import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeading } from "@/components/shared/page-heading";

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Profile"
        title="Your workspace profile"
        description="Manage your review identity, preferred workflow, and the way ClawCheck feels in day-to-day use."
      />

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-white/10 bg-card">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Primary reviewer details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-full bg-white text-black text-xl font-semibold">
                A
              </div>
              <div>
                <p className="text-lg font-semibold">Asad</p>
                <p className="text-sm text-muted-foreground">Lead evaluator</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-full border-white/10 bg-white/5">
                Safety reviewer
              </Badge>
              <Badge variant="outline" className="rounded-full border-white/10 bg-white/5">
                Dashboard owner
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Current UI and workflow settings</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium">Theme</p>
              <p className="mt-1 text-sm text-muted-foreground">Dark-first with light toggle support</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium">Toasts</p>
              <p className="mt-1 text-sm text-muted-foreground">High-contrast white notifications</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium">Visual motion</p>
              <p className="mt-1 text-sm text-muted-foreground">Subtle Three.js ambient scene</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium">Flow</p>
              <p className="mt-1 text-sm text-muted-foreground">Persistent navbar and simplified evaluation steps</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
