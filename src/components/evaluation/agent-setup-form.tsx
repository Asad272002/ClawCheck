"use client";

import { ClipboardList, Loader2, WandSparkles } from "lucide-react";
import { useEffect, useMemo } from "react";
import type { FieldErrors, Resolver } from "react-hook-form";
import { useForm, useWatch } from "react-hook-form";

import { AgentResponseInput } from "@/components/evaluation/agent-response-input";
import { EvaluationResults } from "@/components/evaluation/evaluation-results";
import { TestCategorySelector } from "@/components/evaluation/test-category-selector";
import { TestPromptCard } from "@/components/evaluation/test-prompt-card";
import { TEST_CASES_BY_CATEGORY } from "@/data/test-cases";
import { useEvaluation } from "@/hooks/use-evaluation";
import {
  evaluationSchema,
  type EvaluationSchema,
} from "@/lib/schemas/evaluation.schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const evaluationResolver: Resolver<EvaluationSchema> = async (
  values,
) => {
  const result = evaluationSchema.safeParse(values);

  if (result.success) {
    return {
      values: result.data,
      errors: {},
    };
  }

  const errors: FieldErrors<EvaluationSchema> = {};

  for (const issue of result.error.issues) {
    const field = issue.path[0];

    if (typeof field !== "string" || errors[field as keyof EvaluationSchema]) {
      continue;
    }

    errors[field as keyof EvaluationSchema] = {
      type: issue.code,
      message: issue.message,
    };
  }

  return {
    values: {},
    errors,
  };
};

export function AgentSetupForm() {
  const { report, isLoading, runEvaluation } = useEvaluation();
  const form = useForm<EvaluationSchema>({
    resolver: evaluationResolver,
    defaultValues: {
      agentName: "testClaw",
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
        <form onSubmit={onSubmit} className="space-y-6">
          <Card className="section-panel">
            <CardContent className="space-y-6 p-6">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Run an evaluation</h2>
                <p className="text-sm text-muted-foreground">
                  Fill in the agent details, confirm the prompt, paste the response, and
                  generate a structured report.
                </p>
              </div>

              <div className="subtle-panel p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ClipboardList className="size-4" />
                  Step-based workflow
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Category selection auto-loads a sample test prompt so you can focus on the
                  answer under review.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="space-y-4 rounded-3xl border border-border/80 bg-card/70 p-5">
                  <div>
                    <p className="text-sm font-semibold text-primary">Step 1</p>
                    <h3 className="text-base font-semibold">Agent details</h3>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label htmlFor="agentName">Agent name</Label>
                      <Input id="agentName" className="rounded-xl border-border bg-background/80" {...form.register("agentName")} />
                      <p className="text-xs text-destructive">{form.formState.errors.agentName?.message}</p>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="agentType">Agent type</Label>
                      <Input id="agentType" className="rounded-xl border-border bg-background/80" {...form.register("agentType")} />
                      <p className="text-xs text-destructive">{form.formState.errors.agentType?.message}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="agentPurpose">Agent purpose</Label>
                    <Textarea id="agentPurpose" rows={4} className="rounded-2xl border-border bg-background/80" {...form.register("agentPurpose")} />
                    <p className="text-xs text-destructive">{form.formState.errors.agentPurpose?.message}</p>
                  </div>
                </div>

                <div className="space-y-4 rounded-3xl border border-border/80 bg-card/70 p-5">
                  <div>
                    <p className="text-sm font-semibold text-primary">Step 2</p>
                    <h3 className="text-base font-semibold">Select category and prompt</h3>
                  </div>
                  <TestCategorySelector control={form.control} name="category" />
                  <p className="text-xs text-destructive">{form.formState.errors.category?.message}</p>
                  <div className="space-y-3">
                    <Label htmlFor="testPrompt">Test prompt</Label>
                    <Textarea id="testPrompt" rows={5} className="rounded-2xl border-border bg-background/80" {...form.register("testPrompt")} />
                    <p className="text-xs text-destructive">{form.formState.errors.testPrompt?.message}</p>
                  </div>
                </div>

                <div className="space-y-4 rounded-3xl border border-border/80 bg-card/70 p-5">
                  <div>
                    <p className="text-sm font-semibold text-primary">Step 3</p>
                    <h3 className="text-base font-semibold">Paste the agent response</h3>
                  </div>
                  <AgentResponseInput value={agentResponse} onChange={(value) => form.setValue("agentResponse", value, { shouldValidate: true })} />
                  <p className="text-xs text-destructive">{form.formState.errors.agentResponse?.message}</p>
                </div>
              </div>

              <Button type="submit" className="w-full rounded-xl py-6 text-sm font-semibold">
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
        </form>
        <div className="space-y-6">
          <TestPromptCard testCase={activeTestCase} />
          <Card className="surface-card">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm font-semibold">What the report will show</p>
              <div className="grid gap-3 text-sm text-muted-foreground">
                <div className="subtle-panel p-4">Final score and pass or fail status</div>
                <div className="subtle-panel p-4">Category-level rubric breakdown</div>
                <div className="subtle-panel p-4">Strengths, weaknesses, and missing risks</div>
                <div className="subtle-panel p-4">Confidence quality and recommendations</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {report ? <EvaluationResults report={report} /> : null}
    </div>
  );
}
