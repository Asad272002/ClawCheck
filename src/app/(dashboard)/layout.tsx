import { AppShell } from "@/components/layout/app-shell";
import { requireCurrentUser } from "@/lib/auth/user";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await requireCurrentUser();

  return <AppShell currentUser={currentUser}>{children}</AppShell>;
}
