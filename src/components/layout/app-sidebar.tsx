import Link from "next/link";
import { ShieldCheck, FileSearch, FlaskConical, BarChart3 } from "lucide-react";

import { cn } from "@/lib/utils";

const sidebarItems = [
  { href: "/dashboard", label: "Overview", icon: ShieldCheck },
  { href: "/evaluations/new", label: "New Evaluation", icon: FlaskConical },
  { href: "/test-cases", label: "Test Cases", icon: FileSearch },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

export function AppSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-black/8 bg-sidebar/80 px-5 py-6 xl:block">
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">Workspace</h2>
          <p className="text-sm text-muted-foreground">
            Pick a page and move through the evaluation flow one step at a time.
          </p>
        </div>
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg border border-black/8 bg-white px-4 py-3 text-sm text-muted-foreground shadow-sm transition hover:bg-zinc-100 hover:text-foreground"
              )}
            >
              <item.icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="rounded-lg border border-black/8 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium">Quick checklist</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Choose a category</li>
            <li>Paste the agent response</li>
            <li>Run the evaluation</li>
            <li>Review the report</li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
