import { Card, CardContent } from "@/components/ui/card";

const steps = [
  "Select test category",
  "Run prompt on target AI agent",
  "Paste response into ClawCheck",
  "Generate evaluation report",
];

export function HowItWorks() {
  return (
    <section className="py-10 sm:py-16">
      <div className="container-shell">
        <Card className="section-panel overflow-hidden">
          <CardContent className="grid gap-8 p-6 lg:grid-cols-[0.8fr_1.2fr] lg:p-8">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">How it works</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Fast evaluation loop for risky AI outputs</h2>
              <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                Use prebuilt prompts, paste a target response, and generate a report that
                teams can review, benchmark, and extend later with LLM-powered grading.
              </p>
              <div className="subtle-panel p-4 text-sm text-muted-foreground">
                Built for demos, hackathons, and early product validation without needing
                database setup or authentication first.
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {steps.map((step, index) => (
                <div key={step} className="surface-card p-5">
                  <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {index + 1}
                  </div>
                  <p className="text-base font-medium">{step}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {index === 0
                      ? "Pick a structured category and load a recommended prompt."
                      : index === 1
                        ? "Test the target model or workflow in your own environment."
                        : index === 2
                          ? "Paste the response so ClawCheck can assess the result."
                          : "Review the final score, risks, and recommended improvements."}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
