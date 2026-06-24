import Link from "next/link";
import { ChevronDown, CircleUserRound, PanelLeft, Search, Settings, Sparkles, User } from "lucide-react";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type DashboardHeaderProps = {
  mobileNavTrigger?: React.ReactNode;
};

export function DashboardHeader({ mobileNavTrigger }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/88 backdrop-blur-xl">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="lg:hidden">
            {mobileNavTrigger ?? (
              <Button variant="outline" size="icon-sm" aria-label="Open navigation">
                <PanelLeft className="size-4" />
              </Button>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-foreground">ClawCheck workspace</p>
              <Badge variant="outline" className="hidden rounded-full border-primary/15 bg-primary/10 text-primary md:inline-flex">
                Live demo
              </Badge>
            </div>
            <p className="hidden text-sm text-muted-foreground md:block">
              Structured safety reviews for privacy, fairness, misuse, and confidence handling.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" className="hidden lg:inline-flex" aria-label="Search workspace">
            <Search className="size-4" />
          </Button>
          <ThemeToggle />
          <Link href="/evaluations/new">
            <Button size="sm" className="rounded-xl px-4">
              <Sparkles className="size-4" />
              New Evaluation
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1.5 text-sm shadow-sm transition hover:bg-accent">
              <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-background">
                <CircleUserRound className="size-4" />
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-medium">Asad</span>
                <span className="block text-xs text-muted-foreground">Lead reviewer</span>
              </span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Workspace</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/profile" className="flex w-full items-center gap-2">
                  <User className="size-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="size-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
