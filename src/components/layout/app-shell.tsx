"use client";

import { PanelLeft } from "lucide-react";
import { useState } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <div className="min-h-screen pb-6">
      <Sheet>
        <DashboardHeader
          sidebarExpanded={sidebarExpanded}
          mobileNavTrigger={
            <SheetTrigger render={<Button variant="outline" size="icon-sm" aria-label="Open navigation" />}>
              <PanelLeft className="size-4" />
            </SheetTrigger>
          }
        />
        <div className="container-shell pt-[5.5rem]">
          <div className="hidden lg:block">
            <AppSidebar
              expanded={sidebarExpanded}
              onExpandedChange={setSidebarExpanded}
              className="fixed top-[5.5rem] left-[max(1rem,calc((100vw-1440px)/2+2rem))] z-40 h-[calc(100vh-6.5rem)] overflow-y-auto"
            />
          </div>
          <main
            className={`min-w-0 pb-4 transition-[padding] duration-300 ${
              sidebarExpanded ? "lg:pl-[17.5rem]" : "lg:pl-[6.25rem]"
            }`}
          >
            {children}
          </main>
        </div>
        <SheetContent side="left" className="w-[88vw] max-w-sm border-r border-border bg-background p-0">
          <SheetHeader className="border-b border-border px-5 py-4">
            <SheetTitle>ClawCheck workspace</SheetTitle>
            <SheetDescription>Browse evaluations, prompts, and generated reports.</SheetDescription>
          </SheetHeader>
          <div className="h-full overflow-y-auto px-4 py-5">
            <AppSidebar />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
