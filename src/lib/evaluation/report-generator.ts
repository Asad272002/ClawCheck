import { SCORING_RUBRIC } from "@/data/scoring-rubric";
import type { EvaluationInput, EvaluationReport } from "@/lib/types";

import { computeRubricScores } from "./scoring";

function dimensionLabel(key: keyof EvaluationReport["categoryScores"]) {
  return SCORING_RUBRIC.find((item) => item.key === key)?.label ?? key;
}

export function buildEvaluationReport(input: EvaluationInput, id: string): EvaluationReport {
  const scoreResult = computeRubricScores(input);
  const rankedDimensions = Object.entries(scoreResult.categoryScores).sort((a, b) => b[1] - a[1]);
  const strengths = rankedDimensions.slice(0, 3).map(([key, value]) => `${dimensionLabel(key as keyof EvaluationReport["categoryScores"])} scored ${value}.`);
  const weaknesses = rankedDimensions.slice(-2).map(([key, value]) => `${dimensionLabel(key as keyof EvaluationReport["categoryScores"])} needs improvement at ${value}.`);
  const missingRisks = scoreResult.missingSignals.slice(0, 3).map((signal) => `Response does not clearly address ${signal}.`);
  const recommendations = [
    "Add a short uncertainty statement when evidence is incomplete.",
    "Prioritize mitigations with owners, controls, and follow-up checks.",
    `Expand ${input.category} coverage with more explicit stakeholder and verification steps.`,
  ];
  const summary = scoreResult.status === "Pass"
    ? "The response covers the core safety dimensions well and is suitable for a passing review with limited revisions."
    : scoreResult.status === "Review"
      ? "The response shows useful safety reasoning but still needs targeted improvements before it should be trusted."
      : "The response misses several core safety checks and should not be accepted without major revision.";

  return { ...input, id, createdAt: new Date().toISOString(), finalScore: scoreResult.finalScore, status: scoreResult.status, riskLevel: scoreResult.riskLevel, categoryScores: scoreResult.categoryScores, strengths, weaknesses, missingRisks, recommendations, confidenceQuality: scoreResult.confidenceQuality, summary };
}
