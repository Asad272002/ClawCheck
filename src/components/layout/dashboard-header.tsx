import Image from "next/image";
import Link from "next/link";
import { ChevronDown, CircleUserRound, PanelLeft, Settings, Sparkles, User } from "lucide-react";

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

type DashboardHeaderProps = {
  mobileNavTrigger?: React.ReactNode;
};

export function DashboardHeader({ mobileNavTrigger }: DashboardHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-3 z-50 bg-transparent">
      <div className="container-shell">
        <div className="flex h-16 items-center justify-between gap-4 rounded-[1.75rem] border border-border/80 bg-background/86 px-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="lg:hidden">
              {mobileNavTrigger ?? (
                <Button variant="outline" size="icon-sm" aria-label="Open navigation">
                  <PanelLeft className="size-4" />
                </Button>
              )}
            </div>
            <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 items-center justify-center overflow-hidden rounded-2xl border border-border/80 bg-card/90 shadow-sm">
                <Image src="/clawlogo-r.png" alt="ClawCheck logo" width={32} height={32} className="h-8 w-8 object-contain" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight text-foreground">ClawCheck</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/evaluations/new">
              <Button size="sm" className="rounded-xl px-3 sm:px-4">
                <Sparkles className="size-4" />
                <span className="hidden sm:inline">New Evaluation</span>
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-border/80 bg-card/90 px-2 py-1.5 text-sm shadow-sm transition hover:bg-accent">
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
      </div>
    </header>
  );
}
