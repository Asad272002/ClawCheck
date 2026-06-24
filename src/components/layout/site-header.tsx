"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, ChevronDown, CircleUserRound, Settings, User } from "lucide-react";
import { usePathname } from "next/navigation";

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
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-black/8 bg-white/80 backdrop-blur-xl">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border border-black/10 bg-white shadow-sm">
            <Image src="/assets/logo.svg" alt="ClawCheck logo" width={24} height={24} />
          </div>
          <div>
            <div className="font-semibold tracking-tight">{siteConfig.name}</div>
            <div className="text-xs text-muted-foreground">AI safety evaluation toolkit</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {siteConfig.navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm transition-colors",
                isActive(item.href)
                  ? "bg-black text-white"
                  : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="hidden rounded-full border border-black/10 bg-white p-2 text-muted-foreground transition hover:bg-zinc-100 hover:text-foreground sm:inline-flex"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
          </button>
          <ThemeToggle />
          <Link
            href="/evaluations/new"
            className={cn(buttonVariants({ variant: "default", size: "lg" }), "hidden rounded-lg sm:inline-flex")}
          >
            Start Evaluation
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-2 py-1.5 text-sm text-foreground shadow-sm transition hover:bg-zinc-50">
              <span className="flex size-8 items-center justify-center rounded-full bg-black text-white">
                <CircleUserRound className="size-4" />
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-medium">Asad</span>
                <span className="block text-xs text-muted-foreground">Profile</span>
              </span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 border border-black/10 bg-popover/95">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/profile" className="flex w-full items-center gap-2">
                  <User className="size-4" />
                  View Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="flex w-full items-center gap-2">
                  <Settings className="size-4" />
                  Settings
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
