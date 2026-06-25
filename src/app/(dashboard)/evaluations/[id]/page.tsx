import { notFound } from "next/navigation";

import { EvaluationResults } from "@/components/evaluation/evaluation-results";
import { PageHeading } from "@/components/shared/page-heading";
import { getReportById } from "@/lib/db/reports";

export default async function EvaluationReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReportById(id);

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
