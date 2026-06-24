export const siteConfig = {
  name: "ClawCheck",
  shortName: "ClawCheck",
  description: "AI agent safety and reliability evaluation toolkit for structured red-team testing and reporting.",
  url: "https://github.com/your-org/clawcheck",
  tagline: "AI Agent Safety & Reliability Evaluation",
  marketingNavItems: [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/test-cases", label: "Test Cases" },
    { href: "/reports", label: "Reports" },
  ],
  appNavItems: [
    { href: "/dashboard", label: "Overview" },
    { href: "/evaluations/new", label: "New Evaluation" },
    { href: "/test-cases", label: "Test Cases" },
    { href: "/reports", label: "Reports" },
    { href: "/profile", label: "Profile" },
  ],
} as const;
