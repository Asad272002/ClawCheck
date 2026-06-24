"use client";

import Link from "next/link";
import { BarChart3, FileSearch, FlaskConical, ShieldCheck } from "lucide-react";
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
    <aside className={cn("flex h-full flex-col gap-6", className)}>
      <div className="rounded-3xl border border-sidebar-border bg-sidebar p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] dark:shadow-none">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">Workspace</h2>
          <p className="text-sm text-muted-foreground">
            Move through the evaluation flow from prompt library to final report.
          </p>
        </div>
      </div>
      <nav className="space-y-2">
        {appSidebarItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm font-medium transition-all",
                active
                  ? "border-primary/15 bg-primary/10 text-foreground shadow-[0_10px_24px_rgba(79,70,229,0.12)]"
                  : "border-border bg-card/90 text-muted-foreground hover:border-primary/15 hover:bg-accent hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <item.icon className="size-4" />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="rounded-3xl border border-sidebar-border bg-sidebar p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] dark:shadow-none">
        <p className="text-sm font-semibold">Start here</p>
        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
          <li>1. Pick a test category</li>
          <li>2. Run the prompt on your target agent</li>
          <li>3. Paste the response</li>
          <li>4. Generate the report</li>
        </ul>
      </div>
    </aside>
  );
}
