import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
    <section className="py-16 sm:py-20">
      <div className="container-shell">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
                ClawCheck
              </h1>
              <p className="max-w-3xl text-lg text-muted-foreground sm:text-xl">
                AI Agent Safety & Reliability Evaluation
              </p>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                Test AI agent responses against clear categories like privacy, hallucination,
                fairness, misuse risk, confidence handling, and stakeholder harm without
                overwhelming your team.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/evaluations/new" className={cn(buttonVariants({ size: "lg" }), "rounded-lg")}>
                Start Evaluation
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/test-cases"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-lg border-white/10 bg-white/5"
                )}
              >
                View Test Cases
              </Link>
            </div>
            <div className="grid max-w-xl gap-4 sm:grid-cols-3">
              {heroMetrics.map((item) => (
                <Card key={item.label} className="border-white/10 bg-card">
                  <CardContent className="space-y-1 py-4">
                    <p className="text-xl font-semibold">{item.value}</p>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <Card className="border-white/10 bg-card">
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <p className="text-base font-medium">What ClawCheck helps you do</p>
                <p className="text-sm text-muted-foreground">
                  Use a simple evaluation workflow that stays focused on the response under review.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  "Choose a test category.",
                  "Run the prompt on your target AI agent.",
                  "Paste the response into ClawCheck.",
                  "Read the final score and recommendations.",
                ].map((item, index) => (
                  <div key={item} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                    <div className="mt-0.5 flex size-6 items-center justify-center rounded-full bg-white/10 text-xs font-medium">
                      {index + 1}
                    </div>
                    <p className="text-sm text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
