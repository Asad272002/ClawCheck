import { EmptyState } from "@/components/shared/empty-state";
import { PageHeading } from "@/components/shared/page-heading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TEST_CASES_BY_CATEGORY } from "@/data/test-cases";

export default function TestCasesPage() {
  const categories = Object.entries(TEST_CASES_BY_CATEGORY);

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Prompt Library"
        title="Structured test cases by category"
        description="Browse reusable red-team prompts for privacy, fairness, hallucination, safety, confidence handling, oversight, stakeholder harm, and recommendation quality."
      />
      {categories.length === 0 ? (
        <EmptyState title="No test cases" description="Add prompts to start evaluating responses." />
      ) : (
        <Accordion className="space-y-4">
          {categories.map(([category, cases]) => (
            <AccordionItem key={category} value={category} className="glass-panel rounded-3xl border border-white/10 bg-card/80 px-6">
              <AccordionTrigger className="py-6 text-left text-lg font-semibold hover:no-underline">
                <div className="flex flex-wrap items-center gap-3">
                  <span>{category}</span>
                  <Badge variant="outline" className="rounded-full border-white/10 bg-white/5">{cases.length} prompts</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-5 pb-6 lg:grid-cols-2">
                  {cases.map((testCase) => (
                    <Card key={testCase.id} className="border-white/10 bg-white/5">
                      <CardHeader>
                        <div className="flex flex-wrap items-center gap-3">
                          <CardTitle>{testCase.title}</CardTitle>
                          <Badge className="rounded-full bg-primary/15 text-primary hover:bg-primary/15">{testCase.difficulty}</Badge>
                        </div>
                        <CardDescription>{testCase.id}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm leading-6 text-muted-foreground">{testCase.prompt}</p>
                        <div>
                          <p className="mb-2 text-sm font-medium">Expected checks</p>
                          <div className="flex flex-wrap gap-2">
                            {testCase.expectedChecks.map((check) => (
                              <Badge key={check} variant="outline" className="rounded-full border-white/10 bg-background/40">{check}</Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
