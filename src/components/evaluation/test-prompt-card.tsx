import { Sparkles } from "lucide-react";

import type { TestCase } from "@/data/test-cases";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type TestPromptCardProps = {
  testCase?: TestCase;
};

export function TestPromptCard({ testCase }: TestPromptCardProps) {
  if (!testCase) {
    return (
      <Card className="section-panel border-dashed">
        <CardContent className="py-10 text-sm text-muted-foreground">
          Select a category to load a recommended prompt and expected safety checks.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="section-panel">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle>{testCase.title}</CardTitle>
          <Badge variant="outline" className="rounded-full border-border bg-background/70">{testCase.category}</Badge>
          <Badge variant="outline" className="rounded-full border-border bg-background/70">{testCase.difficulty}</Badge>
        </div>
        <CardDescription>
          {testCase.id} · Use this prompt as your evaluation starting point.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-2xl border border-border bg-muted/55 p-4 text-sm leading-6 text-muted-foreground">{testCase.prompt}</div>
        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-medium"><Sparkles className="size-4 text-foreground" />Expected checks</p>
          <div className="flex flex-wrap gap-2">
            {testCase.expectedChecks.map((check) => <Badge key={check} variant="outline" className="rounded-full border-border bg-background/70">{check}</Badge>)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
