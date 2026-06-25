import { SiteHeader } from "@/components/layout/site-header";
import { getOptionalCurrentUser } from "@/lib/auth/user";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getOptionalCurrentUser();

  return (
    <div className="min-h-screen">
      <SiteHeader currentUser={currentUser} />
      <main>{children}</main>
    </div>
  );
}
