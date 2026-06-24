import Link from "next/link";
import { SearchX } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="section-panel w-full max-w-xl p-10 text-center">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <SearchX className="size-6" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Report or page not found</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The resource you requested does not exist in this ClawCheck workspace.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}
          >
            Home
          </Link>
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "default" }), "rounded-xl")}>
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
