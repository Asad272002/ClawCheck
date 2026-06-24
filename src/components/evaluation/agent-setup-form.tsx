"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardList, Loader2, WandSparkles } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";

import { AgentResponseInput } from "@/components/evaluation/agent-response-input";
import { EvaluationResults } from "@/components/evaluation/evaluation-results";
import { TestCategorySelector } from "@/components/evaluation/test-category-selector";
import { TestPromptCard } from "@/components/evaluation/test-prompt-card";
import { TEST_CASES_BY_CATEGORY } from "@/data/test-cases";
import { useEvaluation } from "@/hooks/use-evaluation";
import { evaluationSchema, type EvaluationSchema } from "@/lib/schemas/evaluation.schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AgentSetupForm() {
  const { report, isLoading, runEvaluation } = useEvaluation();
  const form = useForm<EvaluationSchema>({
    resolver: zodResolver(evaluationSchema as never),
    defaultValues: {
      agentName: "NexiClaw",
      agentPurpose: "Safety and ethics interviewer",
      agentType: "Assessment Agent",
      category: "Privacy",
      testPrompt: "",
      agentResponse: "The proposal raises privacy risks around children's data, consent, retention, and security. The startup should obtain verifiable parental consent, minimize collection, encrypt stored recordings, and publish a clear deletion policy. I cannot verify the local regulatory requirements, so a human legal review is still necessary before launch.",
    },
  });

  const selectedCategory = useWatch({
    control: form.control,
    name: "category",
  });
  const agentResponse = useWatch({
    control: form.control,
    name: "agentResponse",
  });
  const activeTestCase = useMemo(() => TEST_CASES_BY_CATEGORY[selectedCategory]?.[0], [selectedCategory]);

  useEffect(() => {
    if (activeTestCase) {
      form.setValue("testPrompt", activeTestCase.prompt, { shouldValidate: true });
    }
  }, [activeTestCase, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    await runEvaluation(values);
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-white/10 bg-card">
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Run an evaluation</h2>
              <p className="text-sm text-muted-foreground">
                Fill in the agent details, confirm the prompt, paste the response, and run the report.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ClipboardList className="size-4" />
                Simple workflow
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Category selection auto-loads a sample test prompt so you can focus on the response.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="agentName">Agent name</Label>
                <Input id="agentName" className="rounded-lg border-white/10 bg-white/5" {...form.register("agentName")} />
                <p className="text-xs text-destructive">{form.formState.errors.agentName?.message}</p>
              </div>
              <div className="space-y-3">
                <Label htmlFor="agentType">Agent type</Label>
                <Input id="agentType" className="rounded-lg border-white/10 bg-white/5" {...form.register("agentType")} />
                <p className="text-xs text-destructive">{form.formState.errors.agentType?.message}</p>
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="agentPurpose">Agent purpose</Label>
              <Textarea id="agentPurpose" rows={4} className="rounded-lg border-white/10 bg-white/5" {...form.register("agentPurpose")} />
              <p className="text-xs text-destructive">{form.formState.errors.agentPurpose?.message}</p>
            </div>
            <TestCategorySelector control={form.control} name="category" />
            <p className="text-xs text-destructive">{form.formState.errors.category?.message}</p>
            <div className="space-y-3">
              <Label htmlFor="testPrompt">Test prompt</Label>
              <Textarea id="testPrompt" rows={5} className="rounded-lg border-white/10 bg-white/5" {...form.register("testPrompt")} />
              <p className="text-xs text-destructive">{form.formState.errors.testPrompt?.message}</p>
            </div>
            <AgentResponseInput value={agentResponse} onChange={(value) => form.setValue("agentResponse", value, { shouldValidate: true })} />
            <p className="text-xs text-destructive">{form.formState.errors.agentResponse?.message}</p>
            <Button onClick={onSubmit} className="w-full rounded-lg py-6 text-sm font-semibold">
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Running evaluation
                </>
              ) : (
                <>
                  <WandSparkles className="size-4" />
                  Run Evaluation
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        <TestPromptCard testCase={activeTestCase} />
      </div>
      {report ? <EvaluationResults report={report} /> : null}
    </div>
  );
}
