import { TestCaseLibrary } from "@/components/evaluation/test-case-library";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeading } from "@/components/shared/page-heading";
import { getGroupedTestCases } from "@/lib/db/test-cases";

export default async function TestCasesPage() {
  const groupedTestCases = await getGroupedTestCases();
  const categories = Object.entries(groupedTestCases);

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
        <TestCaseLibrary categories={categories} />
      )}
    </div>
  );
}
