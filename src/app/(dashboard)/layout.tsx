import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="xl:flex">
        <AppSidebar />
        <div className="min-w-0 flex-1">
          <main className="container-shell py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
