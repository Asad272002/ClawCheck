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
      <Card className="border-dashed border-white/10 bg-card">
        <CardContent className="py-10 text-sm text-muted-foreground">Select a category to load a recommended prompt and expected safety checks.</CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-card">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle>{testCase.title}</CardTitle>
          <Badge variant="outline" className="rounded-full border-white/10 bg-white/5">{testCase.category}</Badge>
          <Badge variant="outline" className="rounded-full border-white/10 bg-white/5">{testCase.difficulty}</Badge>
        </div>
        <CardDescription>{testCase.id}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm leading-6 text-muted-foreground">{testCase.prompt}</div>
        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-medium"><Sparkles className="size-4 text-foreground" />Expected checks</p>
          <div className="flex flex-wrap gap-2">
            {testCase.expectedChecks.map((check) => <Badge key={check} variant="outline" className="rounded-full border-white/10 bg-white/5">{check}</Badge>)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
