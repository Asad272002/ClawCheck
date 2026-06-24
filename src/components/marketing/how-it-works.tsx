import { Card, CardContent } from "@/components/ui/card";

const steps = [
  "Select test category",
  "Run prompt on target AI agent",
  "Paste response into ClawCheck",
  "Generate evaluation report",
];

export function HowItWorks() {
  return (
    <section className="py-10 sm:py-14">
      <div className="container-shell">
        <Card className="overflow-hidden border-white/10 bg-card">
          <CardContent className="grid gap-6 p-6 lg:grid-cols-[0.8fr_1.2fr] lg:p-8">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">How it works</p>
              <h2 className="text-3xl font-semibold tracking-tight">Fast evaluation loop for risky AI outputs</h2>
              <p className="text-sm leading-6 text-muted-foreground sm:text-base">Use prebuilt prompts, paste a target response, and generate a report that teams can review, benchmark, and extend later with LLM-powered grading.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {steps.map((step, index) => (
                <div key={step} className="rounded-lg border border-white/10 bg-white/5 p-5">
                  <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-foreground">{index + 1}</div>
                  <p className="text-base font-medium">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
