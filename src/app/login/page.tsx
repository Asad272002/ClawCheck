import { redirect } from "next/navigation";

import { AuthPanel } from "@/components/auth/auth-panel";
import { SiteHeader } from "@/components/layout/site-header";
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
    <>
      <SiteHeader currentUser={null} />
      <div className="container-shell pt-28 pb-12 sm:pt-32 sm:pb-16">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1fr] lg:items-start">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Team-ready Workspace Access
            </div>
            <h1 className="max-w-lg text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Sign in to your ClawCheck workspace
            </h1>
            <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              Access the projects you own or the workspaces shared with you. Returning users can jump back in with remembered accounts or continue with email access.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="surface-card p-4">
                <p className="text-sm font-semibold text-foreground">Google SSO</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Fastest route for remembered Google accounts.</p>
              </div>
              <div className="surface-card p-4">
                <p className="text-sm font-semibold text-foreground">Email + password</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Use this when you want a standard manual sign-in flow.</p>
              </div>
            </div>
          </div>
          <div className="lg:pt-1">
            <AuthPanel nextPath={params.next || "/dashboard"} />
          </div>
        </div>
      </div>
    </>
  );
}
