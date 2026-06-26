"use client";

import { CheckCircle2, ChevronRight, ClipboardList, Loader2, PenTool, Sparkles, WandSparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { FieldErrors, Resolver } from "react-hook-form";
import { Controller, useForm, useWatch } from "react-hook-form";

import { AgentResponseInput } from "@/components/evaluation/agent-response-input";
import { TestCategorySelector } from "@/components/evaluation/test-category-selector";
import { TestPromptCard } from "@/components/evaluation/test-prompt-card";
import { useEvaluation } from "@/hooks/use-evaluation";
import {
  evaluationSchema,
  type EvaluationSchema,
} from "@/lib/schemas/evaluation.schema";
import type { AgentWorkspace, EvaluationCategory, EvaluationReport, TestCase } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { RiskBadge } from "@/components/shared/risk-badge";
import { formatRelativeTime } from "@/lib/utils";

type AgentSetupFormProps = {
  groupedTestCases: Record<EvaluationCategory, TestCase[]>;
  workspaces: AgentWorkspace[];
  workspaceReportHistory: Partial<Record<string, EvaluationReport[]>>;
};

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

const generationStages = [
  "Validating the response against ClawCheck's rubric",
  "Scoring risk identification and stakeholder awareness",
  "Drafting the narrative report and recommendations",
  "Finalizing the report for review",
];

type StepCardProps = {
  step: number;
  title: string;
  description: string;
  active: boolean;
  completed: boolean;
  locked?: boolean;
  lockedMessage?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

function StepCard({
  step,
  title,
  description,
  active,
  completed,
  locked = false,
  lockedMessage,
  children,
  footer,
}: StepCardProps) {
  return (
    <Card
      className={`overflow-hidden border transition-all ${
        locked
          ? "border-dashed border-border/80 bg-muted/25"
          : active
            ? "border-primary/30 shadow-[0_20px_50px_rgba(37,99,235,0.12)]"
            : "border-border/80"
      }`}
    >
      <CardContent className="space-y-5 p-6">
        <div className="flex items-start gap-4">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold ${
              completed
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : locked
                  ? "bg-muted text-muted-foreground"
                : active
                  ? "bg-primary/12 text-primary"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {completed ? <CheckCircle2 className="size-4" /> : step}
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {locked ? (
          <div className="rounded-3xl border border-dashed border-border bg-background/70 p-4 text-sm text-muted-foreground">
            {lockedMessage ?? "Complete the previous step to unlock this section."}
          </div>
        ) : (
          <>
            {children}
            {footer ? <div className="flex flex-wrap items-center justify-end gap-3">{footer}</div> : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function GenerationExperience({ progress, stage }: { progress: number; stage: string }) {
  return (
    <Card className="section-panel overflow-hidden">
      <CardContent className="space-y-8 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <PenTool className="size-5 animate-pulse" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">Writing your evaluation report</p>
            <p className="text-sm leading-6 text-muted-foreground">
              ClawCheck is generating the narrative report, scoring the response, and preparing the final review view.
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-3xl border border-border/80 bg-card/70 p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-foreground">{stage}</p>
            <span className="text-sm font-semibold text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="gap-0" />
          <p className="text-xs text-muted-foreground">
            The report will open automatically as soon as it is ready.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4 rounded-3xl border border-border/80 bg-card/70 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Loader2 className="size-4 animate-spin text-primary" />
              Drafting report sections
            </div>
            <Skeleton className="h-6 w-48 rounded-full" />
            <Skeleton className="h-24 w-full rounded-3xl" />
            <Skeleton className="h-24 w-full rounded-3xl" />
            <Skeleton className="h-24 w-full rounded-3xl" />
          </div>
          <div className="space-y-4 rounded-3xl border border-dashed border-primary/25 bg-primary/5 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Sparkles className="size-4" />
              Generative report preview
            </div>
            <div className="rounded-3xl border border-primary/15 bg-background/85 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <PenTool className="size-4" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-[92%]" />
                <Skeleton className="h-3 w-[88%]" />
                <Skeleton className="h-3 w-[84%]" />
                <Skeleton className="h-3 w-[80%]" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AgentSetupForm({ groupedTestCases, workspaces, workspaceReportHistory }: AgentSetupFormProps) {
  const router = useRouter();
  const { isLoading, runEvaluation } = useEvaluation();
  const [currentStep, setCurrentStep] = useState(1);
  const [generationStageIndex, setGenerationStageIndex] = useState(0);
  const form = useForm<EvaluationSchema>({
    resolver: evaluationResolver,
    defaultValues: {
      agentName: "",
      agentPurpose: "",
      agentType: "",
      workspaceId: undefined,
      category: "Privacy",
      testPrompt: "",
      agentResponse: "",
    },
  });

  const selectedCategory = useWatch({
    control: form.control,
    name: "category",
  });
  const agentName = useWatch({
    control: form.control,
    name: "agentName",
  });
  const agentPurpose = useWatch({
    control: form.control,
    name: "agentPurpose",
  });
  const agentType = useWatch({
    control: form.control,
    name: "agentType",
  });
  const selectedWorkspaceId = useWatch({
    control: form.control,
    name: "workspaceId",
  });
  const testPrompt = useWatch({
    control: form.control,
    name: "testPrompt",
  });
  const agentResponse = useWatch({
    control: form.control,
    name: "agentResponse",
  });
  const categoryTestCases = useMemo(
    () => groupedTestCases[selectedCategory] ?? [],
    [groupedTestCases, selectedCategory],
  );
  const [selectedTestCaseId, setSelectedTestCaseId] = useState<string>(categoryTestCases[0]?.id ?? "");
  const resolvedSelectedTestCaseId = categoryTestCases.some((testCase) => testCase.id === selectedTestCaseId)
    ? selectedTestCaseId
    : (categoryTestCases[0]?.id ?? "");
  const activeTestCase = useMemo(
    () => categoryTestCases.find((testCase) => testCase.id === resolvedSelectedTestCaseId) ?? categoryTestCases[0],
    [categoryTestCases, resolvedSelectedTestCaseId],
  );

  useEffect(() => {
    form.setValue("testPrompt", activeTestCase?.prompt ?? "", { shouldValidate: true });
  }, [activeTestCase, form]);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setGenerationStageIndex((current) => Math.min(current + 1, generationStages.length - 1));
    }, 1300);

    return () => window.clearInterval(intervalId);
  }, [isLoading]);

  const progressValue = Math.round((currentStep / 4) * 100);
  const completedSteps = {
    one: agentName.trim().length >= 2 && agentPurpose.trim().length >= 10 && agentType.trim().length >= 2,
    two: Boolean(selectedCategory) && testPrompt.trim().length >= 20,
    three: agentResponse.trim().length >= 40,
  };
  const unlockedStep = completedSteps.one ? (completedSteps.two ? (completedSteps.three ? 4 : 3) : 2) : 1;
  const selectedWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspaceId);
  const selectedWorkspaceHistory = useMemo(
    () => (selectedWorkspaceId ? workspaceReportHistory[selectedWorkspaceId] ?? [] : []),
    [selectedWorkspaceId, workspaceReportHistory]
  );
  const recentWorkspaceHistory = selectedWorkspaceHistory.slice(0, 4);

  function describePrompt(prompt: string) {
    return prompt.length > 110 ? `${prompt.slice(0, 107)}...` : prompt;
  }

  const continueToStep = async (fields: Array<keyof EvaluationSchema>, nextStep: number) => {
    const valid = await form.trigger(fields);

    if (valid) {
      setCurrentStep(nextStep);
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setGenerationStageIndex(0);
    const report = await runEvaluation(values);
    router.push(`/evaluations/${report.id}`);
    router.refresh();
  });

  if (isLoading) {
    return (
      <GenerationExperience
        progress={Math.min(96, 25 + generationStageIndex * 23)}
        stage={generationStages[generationStageIndex] ?? generationStages[0]}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="section-panel overflow-hidden">
        <CardContent className="space-y-6 p-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <ClipboardList className="size-3.5" />
              Guided Flow
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Run an evaluation without losing context</h2>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                Move through each step in order, validate the details, and let ClawCheck open the finished report as soon as generation completes.
              </p>
            </div>
          </div>
          <div className="space-y-3 rounded-3xl border border-border/80 bg-card/70 p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-foreground">Evaluation progress</p>
              <p className="text-sm text-muted-foreground">{`Step ${currentStep} of 4`}</p>
            </div>
            <Progress value={progressValue} className="gap-0" />
            <div className="grid gap-3 md:grid-cols-4">
              {[
                { step: 1, label: "Setup" },
                { step: 2, label: "Prompt" },
                { step: 3, label: "Response" },
                { step: 4, label: "Generate" },
              ].map((item) => (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => {
                    if (item.step <= unlockedStep) {
                      setCurrentStep(item.step);
                    }
                  }}
                  disabled={item.step > unlockedStep}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    currentStep === item.step
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : item.step < currentStep
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : item.step > unlockedStep
                          ? "cursor-not-allowed border-dashed border-border/70 bg-muted/40 text-muted-foreground/80"
                          : "border-border bg-background/70 text-muted-foreground"
                  }`}
                >
                  <p className="font-semibold">{`Step ${item.step}`}</p>
                  <p className="mt-1 text-xs">{item.label}</p>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <form onSubmit={onSubmit} className="space-y-5">
          {currentStep === 1 ? (
            <StepCard
              step={1}
              title="Agent and project context"
              description="Choose whether this is a one-off review or a workspace-based training run for a single tracked agent."
              active
              completed={completedSteps.one}
              footer={
                <Button type="button" className="rounded-xl" onClick={() => continueToStep(["agentName", "agentType", "agentPurpose"], 2)}>
                  Continue
                  <ChevronRight className="size-4" />
                </Button>
              }
            >
              <div className="space-y-3">
                <Label>Evaluation mode</Label>
                <Controller
                  control={form.control}
                  name="workspaceId"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? "__none"}
                      onValueChange={(value) => {
                        if (value === "__none") {
                          field.onChange(undefined);
                          form.setValue("agentName", "", { shouldValidate: true });
                          form.setValue("agentType", "", { shouldValidate: true });
                          form.setValue("agentPurpose", "", { shouldValidate: true });
                          return;
                        }

                        const workspace = workspaces.find((item) => item.id === value);
                        field.onChange(value);

                        if (workspace) {
                          form.setValue("agentName", workspace.agentName, { shouldValidate: true });
                          form.setValue("agentType", workspace.agentType, { shouldValidate: true });
                          form.setValue("agentPurpose", workspace.purpose, { shouldValidate: true });
                        }
                      }}
                    >
                      <SelectTrigger className="h-12 w-full rounded-xl border-border bg-background/80 px-4">
                        <SelectValue placeholder="Choose how this evaluation should be tracked" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border bg-popover">
                        <SelectItem value="__none">General one-time evaluation</SelectItem>
                        {workspaces.map((workspace) => (
                          <SelectItem key={workspace.id} value={workspace.id}>
                            <span>{workspace.name}</span>
                            <span className="text-xs text-muted-foreground">{workspace.agentName}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Leave the workspace empty for one-time reviews. Select a workspace only when you want to keep training history for that single tracked agent.
                </p>
              </div>

              {selectedWorkspace ? (
                <div className="grid gap-4">
                  <div className="rounded-3xl border border-primary/15 bg-primary/5 p-5">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">Workspace agent loaded</p>
                      <p className="text-sm text-muted-foreground">
                        This evaluation will be tied to <span className="font-medium text-foreground">{selectedWorkspace.name}</span> and will use the saved agent profile below.
                      </p>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-border/70 bg-background/85 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Agent name</p>
                        <p className="mt-2 text-sm font-medium text-foreground">{selectedWorkspace.agentName}</p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-background/85 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Agent type</p>
                        <p className="mt-2 text-sm font-medium text-foreground">{selectedWorkspace.agentType}</p>
                      </div>
                    </div>
                    <div className="mt-4 rounded-2xl border border-border/70 bg-background/85 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Saved workspace purpose</p>
                      <p className="mt-2 text-sm leading-6 text-foreground">{selectedWorkspace.purpose}</p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-border/80 bg-card/75 p-5">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">Previous runs on this agent</p>
                      <p className="text-sm text-muted-foreground">
                        Review what has already been tested in this workspace before you run the next evaluation.
                      </p>
                    </div>

                    {recentWorkspaceHistory.length > 0 ? (
                      <div className="mt-4 space-y-3">
                        {recentWorkspaceHistory.map((report) => (
                          <div key={report.id} className="rounded-2xl border border-border/70 bg-background/85 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground">{report.category}</p>
                                <p className="text-xs text-muted-foreground">{formatRelativeTime(report.createdAt)}</p>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                                  {report.finalScore}
                                </span>
                                <RiskBadge status={report.status} />
                                <RiskBadge riskLevel={report.riskLevel} />
                              </div>
                            </div>
                            <p className="mt-3 text-sm text-muted-foreground">{describePrompt(report.testPrompt)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-2xl border border-dashed border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
                        No saved workspace runs yet. This will become the first tracked evaluation for this agent.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label htmlFor="agentName">Agent name</Label>
                      <Input
                        id="agentName"
                        placeholder="e.g. GuardianOps Assistant"
                        className="rounded-xl border-border bg-background/80"
                        {...form.register("agentName")}
                      />
                      <p className="text-xs text-destructive">{form.formState.errors.agentName?.message}</p>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="agentType">Agent type</Label>
                      <Input
                        id="agentType"
                        placeholder="e.g. Support agent"
                        className="rounded-xl border-border bg-background/80"
                        {...form.register("agentType")}
                      />
                      <p className="text-xs text-destructive">{form.formState.errors.agentType?.message}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="agentPurpose">Agent purpose</Label>
                    <Textarea
                      id="agentPurpose"
                      rows={4}
                      placeholder="Describe what this agent is supposed to do and who it serves."
                      className="rounded-2xl border-border bg-background/80"
                      {...form.register("agentPurpose")}
                    />
                    <p className="text-xs text-destructive">{form.formState.errors.agentPurpose?.message}</p>
                  </div>
                </>
              )}
            </StepCard>
          ) : null}

          {currentStep === 2 ? (
            <StepCard
              step={2}
              title="Category and prompt"
              description="Pick the risk area and choose the exact prompt you want to evaluate."
              active
              completed={Boolean(completedSteps.two)}
              footer={
                <>
                  <Button type="button" variant="outline" className="rounded-xl" onClick={() => setCurrentStep(1)}>
                    Back
                  </Button>
                  <Button type="button" className="rounded-xl" onClick={() => continueToStep(["category", "testPrompt"], 3)}>
                    Continue
                    <ChevronRight className="size-4" />
                  </Button>
                </>
              }
            >
              <TestCategorySelector
                control={form.control}
                groupedTestCases={groupedTestCases}
                name="category"
                onCategoryChange={(category) => {
                  const nextTestCase = groupedTestCases[category]?.[0];
                  setSelectedTestCaseId(nextTestCase?.id ?? "");
                }}
              />
              <p className="text-xs text-destructive">{form.formState.errors.category?.message}</p>
              <div className="space-y-3">
                <Label>Select a prompt</Label>
                <Select
                  value={resolvedSelectedTestCaseId || undefined}
                  onValueChange={(value) => setSelectedTestCaseId(value ?? "")}
                >
                  <SelectTrigger className="h-12 w-full rounded-xl border-border bg-background/80 px-4">
                    <SelectValue placeholder="Choose a prompt from this category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border bg-popover">
                    {categoryTestCases.map((testCase) => (
                      <SelectItem key={testCase.id} value={testCase.id}>
                        {testCase.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Each category can have multiple prompt templates. Pick the one that best matches the scenario you want to test.
                </p>
              </div>
              <div className="space-y-3">
                <Label htmlFor="testPrompt">Test prompt</Label>
                <Textarea id="testPrompt" rows={6} className="rounded-2xl border-border bg-background/80" {...form.register("testPrompt")} />
                <p className="text-xs text-destructive">{form.formState.errors.testPrompt?.message}</p>
              </div>
            </StepCard>
          ) : null}

          {currentStep === 3 ? (
            <StepCard
              step={3}
              title="Response under review"
              description="Paste the target answer so ClawCheck can score it against the selected rubric."
              active
              completed={completedSteps.three}
              footer={
                <>
                  <Button type="button" variant="outline" className="rounded-xl" onClick={() => setCurrentStep(2)}>
                    Back
                  </Button>
                  <Button type="button" className="rounded-xl" onClick={() => continueToStep(["agentResponse"], 4)}>
                    Review before generation
                    <ChevronRight className="size-4" />
                  </Button>
                </>
              }
            >
              <AgentResponseInput
                value={agentResponse}
                onChange={(value) => form.setValue("agentResponse", value, { shouldValidate: true })}
              />
              <p className="text-xs text-destructive">{form.formState.errors.agentResponse?.message}</p>
            </StepCard>
          ) : null}

          {currentStep === 4 ? (
            <StepCard
              step={4}
              title="Review and generate"
              description="Double-check the evaluation context, then let ClawCheck generate and open the final report automatically."
              active
              completed={false}
              footer={
                <>
                  <Button type="button" variant="outline" className="rounded-xl" onClick={() => setCurrentStep(3)}>
                    Back
                  </Button>
                  <Button type="submit" className="rounded-xl px-5 text-sm font-semibold">
                    <WandSparkles className="size-4" />
                    Generate Report
                  </Button>
                </>
              }
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-border/80 bg-background/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Workspace</p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {selectedWorkspace ? selectedWorkspace.name : "No workspace selected"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedWorkspace
                      ? `${selectedWorkspace.agentName} · ${selectedWorkspace.health}`
                      : "This report will still be saved to your report library."}
                  </p>
                </div>
                <div className="rounded-3xl border border-border/80 bg-background/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Category</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{selectedCategory}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activeTestCase ? `${activeTestCase.title} · ${activeTestCase.difficulty}` : "Prompt selection ready"}
                  </p>
                </div>
              </div>
              <div className="rounded-3xl border border-primary/15 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
                After you submit, ClawCheck will show a live generation screen and then open the final evaluation report automatically.
              </div>
            </StepCard>
          ) : null}
        </form>

        <div className="space-y-6 xl:sticky xl:top-28 xl:self-start">
          <TestPromptCard testCase={activeTestCase} />
          <Card className="surface-card">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm font-semibold text-foreground">What the generated report will include</p>
              <div className="grid gap-3 text-sm text-muted-foreground">
                <div className="subtle-panel p-4">Final score with pass, review, or fail status</div>
                <div className="subtle-panel p-4">Category-level rubric scoring breakdown</div>
                <div className="subtle-panel p-4">Weaknesses, missing risks, and concrete recommendations</div>
                <div className="subtle-panel p-4">Confidence quality analysis and narrative summary</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
