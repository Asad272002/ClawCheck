"use client";

import type { FocusEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BarChart3, FileSearch, FlaskConical, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export const appSidebarItems = [
  { href: "/dashboard", label: "Overview", icon: ShieldCheck },
  { href: "/evaluations/new", label: "New Evaluation", icon: FlaskConical },
  { href: "/test-cases", label: "Test Cases", icon: FileSearch },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

type AppSidebarProps = {
  className?: string;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
};

export function AppSidebar({
  className,
  expanded = true,
  onExpandedChange,
}: AppSidebarProps) {
  const pathname = usePathname();
  const interactive = typeof onExpandedChange === "function";
  const isExpanded = interactive ? expanded : true;

  const handleBlurCapture = (event: FocusEvent<HTMLElement>) => {
    if (!interactive) {
      return;
    }

    const nextFocused = event.relatedTarget;

    if (nextFocused instanceof Node && event.currentTarget.contains(nextFocused)) {
      return;
    }

    onExpandedChange(false);
  };

  return (
    <aside
      onMouseEnter={interactive ? () => onExpandedChange(true) : undefined}
      onMouseLeave={interactive ? () => onExpandedChange(false) : undefined}
      onFocusCapture={interactive ? () => onExpandedChange(true) : undefined}
      onBlurCapture={interactive ? handleBlurCapture : undefined}
      onPointerDownCapture={interactive ? () => onExpandedChange(true) : undefined}
      className={cn(
        "flex h-full flex-col gap-5 rounded-[1.75rem] border border-slate-800/55 bg-[linear-gradient(180deg,rgba(7,16,41,0.98),rgba(5,11,30,0.95))] text-slate-100 shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition-[width,padding] duration-300 ease-out",
        interactive
          ? expanded
            ? "w-64 p-4"
            : "w-[4.75rem] p-2.5"
          : "w-full p-4",
        className
      )}
    >
      <Link href="/dashboard" className="flex items-center gap-3 rounded-2xl px-1 py-1">
        <Image
          src="/clawlogo-r.png"
          alt="ClawCheck logo"
          width={40}
          height={40}
          className={cn(
            "h-10 w-10 shrink-0 object-contain transition-transform duration-300",
            expanded && interactive ? "scale-105" : "scale-100"
          )}
        />
        <div
          className={cn(
            "min-w-0 overflow-hidden transition-all duration-200",
            interactive ? (expanded ? "max-w-40 opacity-100" : "max-w-0 opacity-0") : "max-w-40 opacity-100"
          )}
        >
          <p className="truncate text-base font-semibold tracking-tight text-white">ClawCheck</p>
          <p className="truncate text-xs text-slate-400">Safety workspace</p>
        </div>
      </Link>
      <nav className="space-y-2 pt-2">
        {appSidebarItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={cn(
                "flex items-center rounded-2xl text-sm font-medium transition-all",
                isExpanded ? "gap-3 px-2.5 py-3 justify-start" : "h-14 justify-center px-0 py-0",
                isExpanded
                  ? active
                    ? "bg-white/10 text-white shadow-[0_10px_22px_rgba(15,23,42,0.16)] ring-1 ring-white/8"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                  : active
                    ? "text-white"
                    : "text-slate-300 hover:text-white"
              )}
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl transition-all",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/7 text-slate-300"
                )}
              >
                <item.icon className="size-4" />
              </span>
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all duration-200",
                  interactive ? (expanded ? "max-w-40 opacity-100" : "max-w-0 opacity-0") : "max-w-40 opacity-100"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
      <div
        className={cn(
          "mt-auto overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 transition-all duration-200",
          interactive
            ? expanded
              ? "max-h-80 p-4 opacity-100"
              : "max-h-0 p-0 opacity-0 border-transparent"
            : "max-h-80 p-4 opacity-100"
        )}
      >
        <p className="text-sm font-semibold text-white">Start a clean review</p>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Pick a prompt, paste a response, and generate a compact safety report.
        </p>
        <Link
          href="/evaluations/new"
          className="mt-4 flex items-center justify-between rounded-xl bg-white px-3.5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
        >
          New evaluation
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </aside>
  );
}
