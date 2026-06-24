import { FeatureGrid } from "@/components/marketing/feature-grid";
import { HeroSection } from "@/components/marketing/hero-section";
import { HowItWorks } from "@/components/marketing/how-it-works";

export default function MarketingPage() {
  return (
    <>
      <HeroSection />
      <FeatureGrid />
      <HowItWorks />
    </>
  );
}
