import Link from "next/link";
import { SearchX } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-panel w-full max-w-xl rounded-[2rem] border border-white/10 p-10 text-center">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full border border-white/10 bg-white/5"><SearchX className="size-6 text-primary" /></div>
        <h1 className="text-3xl font-semibold tracking-tight">Report or page not found</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">The resource you requested does not exist in this ClawCheck workspace.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "rounded-full border-white/10 bg-white/5")}>Home</Link>
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "default" }), "rounded-full")}>Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
