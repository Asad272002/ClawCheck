import { ShieldAlert, Radar, BarChart3, FileCheck2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  { title: "Red-team prompts", description: "Structured prompts that probe privacy, bias, misuse, and failure modes for production agents.", icon: ShieldAlert },
  { title: "Risk checks", description: "Keyword and rubric-based evaluation tuned for stakeholder harm, oversight, and reliability signals.", icon: Radar },
  { title: "Confidence scoring", description: "Measures whether answers acknowledge uncertainty, evidence gaps, and verification limits.", icon: BarChart3 },
  { title: "Evaluation reports", description: "Turn responses into shareable scorecards with strengths, weaknesses, and recommended improvements.", icon: FileCheck2 },
];

export function FeatureGrid() {
  return (
    <section className="py-10 sm:py-14">
      <div className="container-shell space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Capabilities</p>
          <h2 className="text-3xl font-semibold tracking-tight">Purpose-built for AI safety reviews</h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">ClawCheck gives teams a polished first version of an evaluation stack without forcing auth, databases, or LLM integrations on day one.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="border-white/10 bg-card">
              <CardHeader>
                <div className="mb-3 flex size-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-foreground">
                  <feature.icon className="size-5" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">Built with modular components, mock data separation, and future-ready evaluation hooks.</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
