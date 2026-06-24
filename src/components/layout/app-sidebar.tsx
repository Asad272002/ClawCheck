"use client";

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
};

export function AppSidebar({ className }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full flex-col gap-5 rounded-[1.75rem] border border-slate-800/55 bg-[linear-gradient(180deg,rgba(7,16,41,0.98),rgba(5,11,30,0.95))] p-4 text-slate-100 shadow-[0_18px_40px_rgba(15,23,42,0.18)]",
        className
      )}
    >
      <Link href="/dashboard" className="flex items-center gap-3 rounded-2xl px-2 py-1">
        <div className="flex size-11 items-center justify-center overflow-hidden rounded-2xl bg-white/7 ring-1 ring-white/10">
          <Image src="/clawlogo-r.png" alt="ClawCheck logo" width={36} height={36} className="h-9 w-9 object-contain" />
        </div>
        <div className="min-w-0">
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
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-all",
                active
                  ? "bg-white/10 text-white shadow-[0_10px_22px_rgba(15,23,42,0.16)] ring-1 ring-white/8"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/7 text-slate-300"
                )}
              >
                <item.icon className="size-4" />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
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
