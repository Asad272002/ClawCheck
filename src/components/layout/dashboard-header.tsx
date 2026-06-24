import Link from "next/link";
import { Sparkles } from "lucide-react";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-background/95">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">ClawCheck dashboard</p>
          <p className="text-sm text-muted-foreground">
            Review recent reports, browse test prompts, or start a new evaluation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/evaluations/new">
            <Button className="rounded-lg">
              <Sparkles className="size-4" />
              New Evaluation
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
