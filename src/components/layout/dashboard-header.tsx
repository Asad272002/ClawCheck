"use client";

import Image from "next/image";
import Link from "next/link";
import { PanelLeft } from "lucide-react";
import { useEffect, useState } from "react";

import { AccountMenu } from "@/components/auth/account-menu";
import type { AppUser } from "@/lib/auth/user";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";

type DashboardHeaderProps = {
  currentUser: AppUser;
  mobileNavTrigger?: React.ReactNode;
  sidebarExpanded?: boolean;
};

export function DashboardHeader({
  currentUser,
  mobileNavTrigger,
  sidebarExpanded = false,
}: DashboardHeaderProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 24) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-3 z-50 bg-transparent transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0 pointer-events-none"
      }`}
    >
      <div className="container-shell">
        <div
          className={`flex h-16 items-center justify-between gap-4 rounded-[1.75rem] border border-border/80 bg-background/86 px-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-[margin] duration-300 sm:px-5 ${
            sidebarExpanded ? "lg:ml-[11rem]" : "lg:ml-[0.25rem]"
          }`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="lg:hidden">
              {mobileNavTrigger ?? (
                <Button variant="outline" size="icon-sm" aria-label="Open navigation">
                  <PanelLeft className="size-4" />
                </Button>
              )}
            </div>
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <Image src="/clawlogo-r.png" alt="ClawCheck logo" width={36} height={36} className="h-9 w-9 object-contain" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight text-foreground">ClawCheck</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AccountMenu
              currentUser={currentUser}
              label="Workspace account"
              triggerClassName="flex items-center gap-2 rounded-full border border-border/80 bg-card/90 px-2 py-1.5 text-sm shadow-sm transition hover:bg-accent"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
