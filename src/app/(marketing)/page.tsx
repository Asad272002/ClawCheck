import { FeatureGrid } from "@/components/marketing/feature-grid";
import { HeroSection } from "@/components/marketing/hero-section";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { getOptionalCurrentUser } from "@/lib/auth/user";

export default async function MarketingPage() {
  const currentUser = await getOptionalCurrentUser();

  return (
    <>
      <HeroSection isAuthenticated={Boolean(currentUser)} />
      <FeatureGrid />
      <HowItWorks />
    </>
  );
}
