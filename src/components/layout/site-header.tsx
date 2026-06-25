"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  CircleUserRound,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { AppUser } from "@/lib/auth/user";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  currentUser: AppUser | null;
};

export function SiteHeader({ currentUser }: SiteHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
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

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <Sheet>
      <header
        className={`nav-shell fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          visible ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0 pointer-events-none"
        }`}
      >
        <div className="container-shell flex h-18 items-center gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="relative flex size-12 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-primary/12 blur-xl" />
              <Image src="/clawlogo-r.png" alt="ClawCheck logo" width={38} height={38} className="relative h-9 w-9 object-contain drop-shadow-[0_8px_18px_rgba(37,99,235,0.28)]" />
            </div>
            <div className="min-w-0">
              <div className="text-[1.05rem] font-semibold tracking-tight text-foreground">{siteConfig.name}</div>
              <div className="truncate text-xs font-medium text-primary/80">AI safety evaluation toolkit</div>
            </div>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 lg:flex">
            {siteConfig.marketingNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-medium",
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {currentUser ? (
              <>
                <Link
                  href="/dashboard"
                  className={cn(buttonVariants({ size: "sm" }), "hidden rounded-xl px-4 sm:inline-flex")}
                >
                  <Sparkles className="size-4" />
                  Open Dashboard
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger className="hidden items-center gap-2 rounded-full border border-border bg-card px-2 py-1.5 text-sm shadow-sm transition hover:bg-accent sm:flex">
                    <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-background">
                      <CircleUserRound className="size-4" />
                    </span>
                    <span className="hidden text-left md:block">
                      <span className="block text-sm font-medium">{currentUser.name}</span>
                      <span className="block text-xs text-muted-foreground">{currentUser.email}</span>
                    </span>
                    <ChevronDown className="size-4 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href="/profile" className="flex w-full items-center gap-2">
                        <User className="size-4" />
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="size-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        const supabase = createSupabaseBrowserClient();
                        await supabase.auth.signOut();
                        router.push("/login");
                        router.refresh();
                      }}
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link
                href="/login"
                className={cn(buttonVariants({ size: "sm" }), "hidden rounded-xl px-4 sm:inline-flex")}
              >
                Sign In
              </Link>
            )}
            <SheetTrigger
              render={<button aria-label="Open menu" className="flex size-10 items-center justify-center rounded-xl border border-border bg-card shadow-sm lg:hidden" />}
            >
              <Menu className="size-4" />
            </SheetTrigger>
          </div>
        </div>
      </header>
      <SheetContent side="right" className="w-[88vw] max-w-sm border-l border-border bg-background p-0">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle>ClawCheck</SheetTitle>
          <SheetDescription>Navigate the site and jump into a new evaluation.</SheetDescription>
        </SheetHeader>
        <div className="space-y-2 p-5">
          {siteConfig.marketingNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex rounded-2xl px-4 py-3 text-sm font-medium",
                isActive(item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={currentUser ? "/dashboard" : "/login"}
            className={cn(buttonVariants({ size: "lg" }), "mt-4 w-full rounded-xl")}
          >
            <Sparkles className="size-4" />
            {currentUser ? "Open Dashboard" : "Sign In"}
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
