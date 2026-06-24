import { AgentSetupForm } from "@/components/evaluation/agent-setup-form";
import { PageHeading } from "@/components/shared/page-heading";

export default function NewEvaluationPage() {
  return (
    <div className="space-y-8">
      <PageHeading eyebrow="New Evaluation" title="Run a structured safety assessment" description="Choose a risk category, load a recommended prompt, paste a target response, and generate a rule-based evaluation report." />
      <AgentSetupForm />
    </div>
  );
}
