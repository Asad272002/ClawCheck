import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Target, TriangleAlert } from "lucide-react";

import { LandingVisual } from "@/components/marketing/landing-visual";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const heroMetrics = [
  { label: "Risk categories", value: "8" },
  { label: "Structured test cases", value: "16+" },
  { label: "Rubric points", value: "100" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-16 pt-14 sm:pb-20 sm:pt-16">
      <div className="hero-grid pointer-events-none absolute inset-x-0 top-0 h-[34rem]" />
      <div className="container-shell relative">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <Sparkles className="size-4" />
                AI evaluation, redesigned for clarity
              </div>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl xl:text-7xl">
                ClawCheck
              </h1>
              <p className="max-w-3xl text-xl font-medium text-foreground/80 sm:text-2xl">
                AI Agent Safety & Reliability Evaluation
              </p>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                Test AI agent responses against clear categories like privacy, hallucination,
                fairness, misuse risk, confidence handling, and stakeholder harm without
                overwhelming your team.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
                  <ShieldCheck className="size-4 text-primary" />
                  Structured safety checks
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  Clear pass or fail reporting
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/evaluations/new"
                className={cn(buttonVariants({ size: "lg" }), "rounded-xl px-5")}
              >
                Start Evaluation
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/test-cases"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-xl px-5"
                )}
              >
                View Test Cases
              </Link>
            </div>
            <div className="grid gap-4 sm:max-w-2xl sm:grid-cols-3">
              {heroMetrics.map((item) => (
                <Card key={item.label} className="surface-card">
                  <CardContent className="space-y-2 py-5">
                    <p className="text-2xl font-semibold tracking-tight">{item.value}</p>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 hidden rounded-[2rem] bg-gradient-to-br from-primary/8 via-transparent to-emerald-500/10 blur-3xl lg:block" />
            <Card className="section-panel ring-blue relative overflow-hidden">
              <LandingVisual />
              <CardContent className="relative z-10 space-y-6 p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-base font-semibold">Evaluation report preview</p>
                    <p className="max-w-sm text-sm text-muted-foreground">
                      See how ClawCheck turns an AI answer into a structured safety report.
                    </p>
                  </div>
                  <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    Pass
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
                  <div className="glass-panel relative overflow-hidden p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Safety score</span>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        Medium risk
                      </span>
                    </div>
                    <div className="relative mx-auto mb-4 flex size-36 items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-[10px] border-primary/10" />
                      <div
                        className="absolute inset-0 rounded-full border-[10px] border-transparent"
                        style={{
                          background:
                            "conic-gradient(from 180deg, rgba(79,70,229,1) 0deg, rgba(79,70,229,1) 295deg, rgba(79,70,229,0.08) 295deg 360deg)",
                          WebkitMask:
                            "radial-gradient(farthest-side, transparent calc(100% - 10px), black calc(100% - 9px))",
                          mask:
                            "radial-gradient(farthest-side, transparent calc(100% - 10px), black calc(100% - 9px))",
                        }}
                      />
                      <div className="text-center">
                        <p className="text-4xl font-semibold tracking-tight">82</p>
                        <p className="text-sm text-muted-foreground">out of 100</p>
                      </div>
                    </div>
                    <div className="subtle-panel p-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Target className="size-4 text-primary" />
                        Confidence quality: Medium
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="glass-panel p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-medium">Risk breakdown</p>
                        <TriangleAlert className="size-4 text-amber-500" />
                      </div>
                      <div className="space-y-4">
                        {[
                          ["Risk identification", 90],
                          ["Stakeholder awareness", 84],
                          ["Uncertainty handling", 76],
                          ["Recommendation quality", 85],
                        ].map(([label, value]) => (
                          <div key={label} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{label}</span>
                              <span className="text-muted-foreground">{value}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-primary to-emerald-400"
                                style={{ width: `${value}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        "Select a category",
                        "Run the prompt",
                        "Paste the response",
                        "Generate the report",
                      ].map((item, index) => (
                        <div key={item} className="glass-panel p-4">
                          <div className="mb-3 flex size-8 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
                            {index + 1}
                          </div>
                          <p className="text-sm font-medium">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
