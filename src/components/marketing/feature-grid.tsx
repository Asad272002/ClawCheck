import { ShieldAlert, Radar, BarChart3, FileCheck2 } from "lucide-react";

import { FeatureCard } from "@/components/marketing/feature-card";

const features = [
  { title: "Red-team prompts", description: "Structured prompts that probe privacy, bias, misuse, and failure modes for production agents.", icon: ShieldAlert },
  { title: "Risk checks", description: "Keyword and rubric-based evaluation tuned for stakeholder harm, oversight, and reliability signals.", icon: Radar },
  { title: "Confidence scoring", description: "Measures whether answers acknowledge uncertainty, evidence gaps, and verification limits.", icon: BarChart3 },
  { title: "Evaluation reports", description: "Turn responses into shareable scorecards with strengths, weaknesses, and recommended improvements.", icon: FileCheck2 },
];

export function FeatureGrid() {
  return (
    <section className="py-10 sm:py-16">
      <div className="container-shell space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Capabilities</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Purpose-built for AI safety reviews</h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            ClawCheck gives teams a polished first version of an evaluation stack without
            forcing auth, databases, or LLM integrations on day one.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              eyebrow={feature.title}
              icon={feature.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
