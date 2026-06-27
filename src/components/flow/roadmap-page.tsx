import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  ArrowDown,
  AudioLines,
  BadgeCheck,
  BarChart3,
  Blocks,
  BookMarked,
  Bot,
  BrainCircuit,
  CheckCheck,
  ChevronRight,
  ClipboardCheck,
  Database,
  FileSearch,
  FolderKanban,
  Layers3,
  LockKeyhole,
  Orbit,
  Radar,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Waypoints,
} from "lucide-react";

import { PageHeading } from "@/components/shared/page-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type BadgePillProps = {
  children: ReactNode;
  className?: string;
};

type SectionHeaderProps = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
};

type FlowCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: "primary" | "emerald" | "amber" | "sky";
};

type RoadmapColumnProps = {
  title: string;
  description: string;
  items: string[];
};

const sectionLinks = [
  { href: "#current-phase", label: "Current Phase" },
  { href: "#integration-phase", label: "OmegaClaw Integration" },
  { href: "#response-improvement", label: "Response Improvement" },
  { href: "#semantic-layer", label: "Semantic Layer" },
  { href: "#sandbox-vision", label: "Future Sandbox" },
  { href: "#future-roadmap", label: "Future Roadmap" },
];

const toneClasses = {
  primary: "bg-primary/10 text-primary border-primary/20",
  emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  sky: "bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400",
} as const;

const currentPhaseSteps = [
  {
    icon: FolderKanban,
    title: "User selects workspace",
    description: "Each workspace stays centered on one agent and its improvement history.",
  },
  {
    icon: FileSearch,
    title: "Chooses red-team test case",
    description: "A structured prompt gives the review a clear safety target.",
  },
  {
    icon: Bot,
    title: "Runs prompt on AI agent / OmegaClaw",
    description: "The agent produces a response or action plan outside ClawCheck.",
  },
  {
    icon: ClipboardCheck,
    title: "Pastes response into ClawCheck",
    description: "ClawCheck becomes the evaluation layer around the agent output.",
  },
  {
    icon: ShieldCheck,
    title: "Deterministic rubric scoring",
    description: "A stable scoring system gives an explainable approval-oriented result.",
  },
  {
    icon: BrainCircuit,
    title: "Semantic coverage analysis",
    description: "The semantic layer checks meaning, not just exact keywords.",
  },
  {
    icon: Database,
    title: "Report saved to evaluation history",
    description: "Deterministic and semantic results persist with the generated report.",
  },
  {
    icon: Radar,
    title: "Workspace analytics updated",
    description: "Repeated misses and next actions roll up into the workspace view.",
  },
  {
    icon: BarChart3,
    title: "Results appear across the app",
    description: "Dashboard, reports, and workspace pages immediately reflect the review.",
  },
];

const omegaClawCards = [
  { icon: AudioLines, title: "Receives messages", description: "User or system prompts enter the agent loop." },
  { icon: Layers3, title: "Uses memory", description: "Context and stored history influence the next move." },
  { icon: BrainCircuit, title: "Uses reasoning", description: "The agent plans how to answer or act." },
  { icon: Blocks, title: "Uses skills", description: "It can call tools, skills, or chained workflows." },
  { icon: Orbit, title: "Produces response / action plan", description: "The agent decides what to say or do next." },
];

const clawCheckCards = [
  { icon: ShieldCheck, title: "Evaluates the response", description: "ClawCheck reviews what the agent actually produced." },
  { icon: ScanSearch, title: "Detects missed review points", description: "Semantic coverage finds what was weak or not clearly covered." },
  { icon: Database, title: "Reads stored reports and workspace patterns", description: "Past reports and workspace history add practical evaluation memory." },
  { icon: BookMarked, title: "Uses organization-specific embedded knowledge", description: "Policies, checklists, and benchmark answers can guide evaluation through retrieval." },
  { icon: Sparkles, title: "Suggests response improvements", description: "Reports can evolve into feedback that helps produce a safer next answer." },
  { icon: LockKeyhole, title: "Can act as a future sandbox gate", description: "For risky actions, the long-term vision is approve, revise, escalate, or block." },
];

const semanticSteps = [
  { icon: ClipboardCheck, title: "Expected safety checks", description: "The test case defines what a strong response should cover." },
  { icon: BadgeCheck, title: "Agent response chunks", description: "The response is split into readable chunks for comparison." },
  { icon: BrainCircuit, title: "Local ONNX embedding model", description: "The embedding model turns meaning into comparable vectors." },
  { icon: Waypoints, title: "384-dimensional vectors", description: "Each expected check and chunk is represented numerically." },
  { icon: Database, title: "Semantic similarity retrieval", description: "Vectors are compared through the retrieval layer to find the closest matches." },
  { icon: CheckCheck, title: "Covered / weak / missed", description: "ClawCheck classifies each expected review point." },
  { icon: Sparkles, title: "Semantic suggestions", description: "The report shows what to tighten next and why." },
];

const organizationExamples = [
  "Internal AI policy",
  "Privacy policy",
  "Security checklist",
  "Compliance documents",
  "Customer support tone guidelines",
  "Safety review forms",
  "Strong and weak benchmark answers",
  "Previous ClawCheck reports",
];

const responseImprovementColumns = [
  {
    title: "Input",
    description: "Signals ClawCheck can use around the original response.",
    items: ["OmegaClaw response", "User goal", "Organization requirements", "Safety policy", "Past report history"],
  },
  {
    title: "ClawCheck Analysis",
    description: "The evaluation and retrieval layer that explains what is strong, weak, or risky.",
    items: ["Deterministic score", "Semantic coverage", "Missed review points", "Similar reports", "Workspace patterns", "Policy/context retrieval"],
  },
  {
    title: "Improved Output",
    description: "A safer next step, not just a static report.",
    items: ["Clearer response", "Stronger caveats", "Better user-specific guidance", "Safer recommendations", "Human oversight when needed", "Revised answer ready for re-testing"],
  },
];

const sandboxChecks = [
  "Test case expectations",
  "Organization policies",
  "Previous reports",
  "Semantic similarity",
  "User-specific needs",
];

const sandboxOutcomes = ["Approve", "Revise", "Ask for human review", "Block unsafe action"];

const whyThisIsBetter = [
  "Generic AI evaluators judge responses broadly.",
  "ClawCheck can judge responses against the organization's own expectations.",
  "Repeated reports create feedback history.",
  "Workspace analytics show whether the agent is improving.",
  "Local embeddings avoid paid embedding API dependency.",
  "Structured report history and semantic retrieval stay in one system.",
];

function BadgePill({ children, className }: BadgePillProps) {
  return (
    <Badge
      className={cn(
        "rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold text-muted-foreground",
        className
      )}
    >
      {children}
    </Badge>
  );
}

function SectionHeader({ id, eyebrow, title, description }: SectionHeaderProps) {
  return (
    <div id={id} className="space-y-3 scroll-mt-28">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">{eyebrow}</p>
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h2>
        <p className="max-w-4xl text-sm leading-7 text-muted-foreground sm:text-base">{description}</p>
      </div>
    </div>
  );
}

function FlowCard({ icon: Icon, title, description, tone = "primary" }: FlowCardProps) {
  return (
    <Card className="surface-card h-full border-border/75">
      <CardContent className="space-y-4 p-5">
        <div className={cn("flex size-11 items-center justify-center rounded-2xl border", toneClasses[tone])}>
          <Icon className="size-5" />
        </div>
        <div className="space-y-2">
          <p className="text-base font-semibold text-foreground">{title}</p>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ConnectorArrow() {
  return (
    <div className="flex items-center justify-center py-1 text-primary/70">
      <ArrowDown className="size-4" />
    </div>
  );
}

function RoadmapColumn({ title, description, items }: RoadmapColumnProps) {
  return (
    <Card className="section-panel h-full border-border/75">
      <CardContent className="space-y-5 p-6">
        <div className="space-y-2">
          <p className="text-xl font-semibold tracking-tight text-foreground">{title}</p>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item} className="subtle-panel flex items-start gap-3 px-4 py-3">
              <ChevronRight className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-sm leading-6 text-foreground">{item}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RoadmapPage() {
  return (
    <div className="space-y-8 [scroll-behavior:smooth]">
      <div className="rounded-[2rem] border border-border/80 bg-card/95 px-6 py-7 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <PageHeading
            eyebrow="Flow"
            title="ClawCheck + OmegaClaw Evaluation Roadmap"
            description="From AI agent response testing to a full safety sandbox for OmegaClaw-style autonomous agents."
            className="gap-0"
          />
          <div className="flex flex-wrap gap-2 lg:max-w-sm lg:justify-end">
            <BadgePill className="bg-primary/10 text-primary">Test agent responses</BadgePill>
            <BadgePill className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Measure semantic coverage
            </BadgePill>
            <BadgePill className="bg-sky-500/10 text-sky-600 dark:text-sky-400">
              Track improvement over time
            </BadgePill>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[1.75rem] border border-border/80 bg-background/70 p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <p className="text-xl font-semibold tracking-tight text-foreground">ClawCheck</p>
                <p className="text-sm text-muted-foreground">Evaluation workspace for safer agents</p>
              </div>
            </div>
            <p className="mt-5 max-w-3xl text-base leading-7 text-foreground/90">
              OmegaClaw acts. ClawCheck evaluates. Together they create a safer agent improvement loop.
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              ClawCheck is not replacing OmegaClaw; it is a validation layer around it. Today that layer reviews pasted
              agent outputs. Over time it can become a safety sandbox before more autonomous behavior is trusted.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-border/80 bg-[linear-gradient(180deg,rgba(79,70,229,0.08),rgba(14,165,233,0.06))] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Presentation angle</p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              <p>
                Start with the current product: structured evaluation, semantic report analysis, and workspace memory.
              </p>
              <p>
                Then connect the story to OmegaClaw: autonomous agent output becomes evaluation input, and future
                versions can gate risky behavior before release.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-[5.5rem] z-20 rounded-[1.5rem] border border-border/80 bg-background/92 px-4 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          {sectionLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-border/70 bg-card/80 px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:border-primary/25 hover:bg-primary/10 hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <section className="space-y-6">
        <SectionHeader
          id="current-phase"
          eyebrow="Current Phase"
          title="What ClawCheck Already Does"
          description="Current capability: ClawCheck already supports deterministic scoring, report generation, semantic coverage, semantic suggestions, similar report matching, workspace semantic analytics, and the UI needed to review all of it."
        />

        <div className="grid gap-3 lg:grid-cols-3">
          {currentPhaseSteps.map((step, index) => (
            <div key={step.title} className="space-y-3">
              <FlowCard icon={step.icon} title={step.title} description={step.description} tone={index % 3 === 1 ? "emerald" : index % 3 === 2 ? "sky" : "primary"} />
              {index < currentPhaseSteps.length - 1 ? <ConnectorArrow /> : null}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader
          id="integration-phase"
          eyebrow="OmegaClaw Integration Phase"
          title="Where OmegaClaw Fits"
          description="Current capability and integration roadmap: OmegaClaw acts. ClawCheck evaluates. ClawCheck does not replace OmegaClaw. It gives OmegaClaw an evaluation and improvement layer."
        />

        <div className="grid gap-6 xl:grid-cols-[1fr_auto_1fr] xl:items-stretch">
          <Card className="section-panel border-border/75">
            <CardContent className="space-y-5 p-6">
              <div className="space-y-2">
                <p className="text-2xl font-semibold tracking-tight text-foreground">OmegaClaw</p>
                <p className="text-sm leading-6 text-muted-foreground">The acting side of the loop.</p>
              </div>
              <div className="space-y-3">
                {omegaClawCards.map((card) => (
                  <div key={card.title} className="subtle-panel flex items-start gap-3 px-4 py-4">
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                      <card.icon className="size-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{card.title}</p>
                      <p className="text-sm leading-6 text-muted-foreground">{card.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center">
            <div className="rounded-[1.5rem] border border-primary/20 bg-primary/10 px-5 py-4 text-center text-sm font-semibold leading-6 text-primary shadow-[0_12px_24px_rgba(79,70,229,0.12)]">
              OmegaClaw output becomes ClawCheck evaluation input,
              <br />
              then ClawCheck feedback can guide the next safer response.
            </div>
          </div>

          <Card className="section-panel border-border/75">
            <CardContent className="space-y-5 p-6">
              <div className="space-y-2">
                <p className="text-2xl font-semibold tracking-tight text-foreground">ClawCheck</p>
                <p className="text-sm leading-6 text-muted-foreground">The validation layer around the agent.</p>
              </div>
              <div className="space-y-3">
                {clawCheckCards.map((card) => (
                  <div key={card.title} className="subtle-panel flex items-start gap-3 px-4 py-4">
                    <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                      <card.icon className="size-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{card.title}</p>
                      <p className="text-sm leading-6 text-muted-foreground">{card.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-[1.75rem] border border-amber-500/20 bg-amber-500/10 p-5 text-sm leading-7 text-foreground/90">
          <p className="font-semibold text-amber-700 dark:text-amber-300">Current capability: integration is external and manual.</p>
          <p className="mt-2 text-muted-foreground">
            Today the flow is simple: copy OmegaClaw output into ClawCheck, run the evaluation, and study the report.
            Future integration can make ClawCheck a direct OmegaClaw skill or a sandbox gate before riskier actions are approved.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader
          id="response-improvement"
          eyebrow="Integration Roadmap"
          title="From Evaluation to Response Improvement"
          description="ClawCheck can evolve from checking agent responses to helping agents produce better responses."
        />

        <div className="grid gap-4 xl:grid-cols-3">
          {responseImprovementColumns.map((column) => (
            <RoadmapColumn
              key={column.title}
              title={column.title}
              description={column.description}
              items={column.items}
            />
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-[1.75rem] border border-primary/20 bg-primary/10 p-5 text-sm leading-7 text-foreground/90">
            <p className="font-semibold text-primary">Current ClawCheck generates evaluation reports and improvement suggestions.</p>
            <p className="mt-2 text-muted-foreground">
              The next step is to use those reports and semantic retrieval results to draft safer, more useful responses.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-amber-500/20 bg-amber-500/10 p-5 text-sm leading-7 text-foreground/90">
            <p className="font-semibold text-amber-700 dark:text-amber-300">
              ClawCheck should not blindly rewrite every response.
            </p>
            <p className="mt-2 text-muted-foreground">
              For high-risk cases, it should recommend human review, refusal, or escalation instead of generating a direct answer.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader
          id="semantic-layer"
          eyebrow="Semantic Intelligence Layer"
          title="How The Semantic Layer Works"
          description="Current capability: ClawCheck converts expected checks and agent response chunks into embeddings. These embeddings capture meaning, not just exact words. The semantic retrieval layer then compares the response against the expected safety checks."
        />

        <div className="grid gap-3 lg:grid-cols-7">
          {semanticSteps.map((step, index) => (
            <div key={step.title} className="space-y-3">
              <FlowCard
                icon={step.icon}
                title={step.title}
                description={step.description}
                tone={index === 2 ? "amber" : index >= 4 ? "sky" : "primary"}
              />
              {index < semanticSteps.length - 1 ? <ConnectorArrow /> : null}
            </div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="section-panel p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Current embedding model</p>
            <p className="mt-3 text-xl font-semibold tracking-tight text-foreground">
              onnx-community/all-MiniLM-L6-v2-ONNX
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <BadgePill className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                free local embeddings
              </BadgePill>
              <BadgePill className="bg-sky-500/10 text-sky-600 dark:text-sky-400">
                no paid OpenAI embedding API required
              </BadgePill>
              <BadgePill className="bg-primary/10 text-primary">easy to reproduce</BadgePill>
              <BadgePill className="bg-amber-500/10 text-amber-600 dark:text-amber-400">
                hackathon-friendly
              </BadgePill>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-border/80 bg-background/70 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Explainability note</p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Semantic analysis currently supports the report. It does not secretly change the final deterministic score
              yet. This keeps scoring explainable while still showing what the response covered, mentioned weakly, or
              missed.
            </p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="section-panel border-border/75">
            <CardContent className="space-y-4 p-6">
              <p className="text-lg font-semibold text-foreground">How organization retrieval works</p>
              <p className="text-sm leading-7 text-muted-foreground">
                ClawCheck can embed organization policies, report history, safety checklists, and benchmark answers.
                These embeddings are stored in the semantic retrieval layer and retrieved during evaluation so the system can judge
                responses against the user&apos;s real context.
              </p>
              <p className="text-sm leading-7 text-muted-foreground">
                This is retrieval, not model training. We are not training a new model. We are embedding documents and
                using them during evaluation.
              </p>
            </CardContent>
          </Card>

          <Card className="section-panel border-border/75">
            <CardContent className="space-y-4 p-6">
              <p className="text-lg font-semibold text-foreground">Why this is better</p>
              <div className="space-y-3">
                {whyThisIsBetter.map((item) => (
                  <div key={item} className="subtle-panel flex items-start gap-3 px-4 py-3">
                    <ChevronRight className="mt-0.5 size-4 shrink-0 text-primary" />
                    <p className="text-sm leading-6 text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader
          id="sandbox-vision"
          eyebrow="Future Safety Sandbox"
          title="Future Safety Sandbox for OmegaClaw"
          description="Future safety sandbox: ClawCheck can evolve into a safety gate around OmegaClaw before risky responses or actions are finalized."
        />

        <div className="grid gap-4 xl:grid-cols-[1fr_auto_1fr] xl:items-stretch">
          <Card className="section-panel border-border/75">
            <CardContent className="space-y-5 p-6">
              <div className="space-y-2">
                <p className="text-xl font-semibold tracking-tight text-foreground">OmegaClaw plans a response or action</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  This future mode evaluates proposals before they are finalized.
                </p>
              </div>
              <div className="subtle-panel space-y-3 px-4 py-4">
                {sandboxChecks.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                    <p className="text-sm leading-6 text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center">
            <div className="rounded-[1.5rem] border border-primary/20 bg-primary/10 px-5 py-4 text-center text-sm font-semibold leading-6 text-primary shadow-[0_12px_24px_rgba(79,70,229,0.12)]">
              ClawCheck checks the plan,
              <br />
              then returns a safety decision.
            </div>
          </div>

          <Card className="section-panel border-border/75">
            <CardContent className="space-y-5 p-6">
              <div className="space-y-2">
                <p className="text-xl font-semibold tracking-tight text-foreground">ClawCheck returns</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  OmegaClaw can revise, escalate, or stop based on the decision.
                </p>
              </div>
              <div className="space-y-3">
                {sandboxOutcomes.map((item, index) => (
                  <div key={item} className="subtle-panel flex items-start gap-3 px-4 py-4">
                    <div
                      className={cn(
                        "rounded-xl p-2",
                        index === 0
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : index === 3
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      )}
                    >
                      <ShieldCheck className="size-4" />
                    </div>
                    <p className="text-sm leading-6 text-foreground">{item}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-4">
                <p className="text-sm leading-6 text-muted-foreground">OmegaClaw revises or escalates.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="section-panel border-border/75">
          <CardContent className="grid gap-6 p-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-3">
              <p className="text-lg font-semibold text-foreground">Organization-specific evaluation knowledge</p>
              <p className="text-sm leading-7 text-muted-foreground">
                In this future mode, ClawCheck becomes a safety gate around OmegaClaw. It can evaluate proposed
                responses or actions before they are finalized, using both general safety rubrics and
                organization-specific knowledge.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {organizationExamples.map((item) => (
                <BadgePill key={item}>{item}</BadgePill>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <SectionHeader
          id="future-roadmap"
          eyebrow="Future Roadmap"
          title="Where The Product Can Go Next"
          description="The roadmap keeps the current evaluation layer explainable while opening a path toward deeper OmegaClaw integration and stronger organizational safety controls."
        />

        <div className="grid gap-4 xl:grid-cols-3">
          <RoadmapColumn
            title="Near-Term"
            description="Strengthen the current evaluation layer without changing its explainable foundation."
            items={[
              "Refine improvement suggestions",
              "Add report export",
              "Improve semantic thresholds",
              "Add stronger benchmark examples",
              "Improve visual workspace comparisons",
            ]}
          />
          <RoadmapColumn
            title="Integration Phase"
            description="Connect ClawCheck more directly to OmegaClaw sessions and configurations."
            items={[
              "Ingest OmegaClaw logs and transcripts",
              "Evaluate full OmegaClaw sessions",
              "Compare OmegaClaw configurations",
              "Add API-based evaluation",
              "Add ClawCheck as an OmegaClaw skill",
            ]}
          />
          <RoadmapColumn
            title="Long-Term"
            description="Turn the evaluation layer into an ongoing safety sandbox for autonomous systems."
            items={[
              "Safety sandbox before risky actions",
              "Organization-specific policy evaluation",
              "Automated regression testing for agents",
              "Benchmark leaderboard",
              "Team collaboration",
              "Continuous agent safety monitoring",
            ]}
          />
        </div>
      </section>

    </div>
  );
}
