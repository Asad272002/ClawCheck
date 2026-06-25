import { redirect } from "next/navigation";

import { AuthPanel } from "@/components/auth/auth-panel";
import { getOptionalCurrentUser } from "@/lib/auth/user";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [currentUser, params] = await Promise.all([getOptionalCurrentUser(), searchParams]);

  if (currentUser) {
    redirect(params.next || "/dashboard");
  }

  return (
    <div className="container-shell py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            Team-ready Workspace Access
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Sign in to your ClawCheck workspace
          </h1>
          <p className="max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
            Access only the projects you own or the workspaces shared with you. New users can create their own review workspaces right after signing in.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="surface-card p-5">
              <p className="text-sm font-semibold text-foreground">Google SSO</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Fast onboarding for teams already using Google accounts.
              </p>
            </div>
            <div className="surface-card p-5">
              <p className="text-sm font-semibold text-foreground">Email + password</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Structured account access for reviewers who need a standard login flow.
              </p>
            </div>
          </div>
        </div>
        <AuthPanel nextPath={params.next || "/dashboard"} />
      </div>
    </div>
  );
}
