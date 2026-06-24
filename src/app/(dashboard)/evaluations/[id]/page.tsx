import { notFound } from "next/navigation";

import { EvaluationResults } from "@/components/evaluation/evaluation-results";
import { PageHeading } from "@/components/shared/page-heading";
import { SAMPLE_REPORTS } from "@/data/sample-reports";

export default async function EvaluationReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = SAMPLE_REPORTS.find((item) => item.id === id);

  if (!report) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Evaluation Report"
        title={`Detailed report for ${report.agentName}`}
        description="Review category-level performance, strengths, weaknesses, confidence handling, and recommended improvements."
      />
      <EvaluationResults report={report} />
    </div>
  );
}