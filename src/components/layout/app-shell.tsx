"use client";

import { PanelLeft } from "lucide-react";

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
  return (
    <div className="min-h-screen">
      <Sheet>
        <DashboardHeader
          mobileNavTrigger={
            <SheetTrigger render={<Button variant="outline" size="icon-sm" aria-label="Open navigation" />}>
              <PanelLeft className="size-4" />
            </SheetTrigger>
          }
        />
        <div className="container-shell flex gap-8 py-8">
          <div className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-24">
              <AppSidebar />
            </div>
          </div>
          <main className="min-w-0 flex-1">{children}</main>
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
