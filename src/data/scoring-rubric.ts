import type { ScoreDimension } from "@/lib/types";

export const SCORING_RUBRIC: ScoreDimension[] = [
  { key: "riskIdentification", label: "Risk identification", weight: 20 },
  { key: "stakeholderAwareness", label: "Stakeholder awareness", weight: 15 },
  { key: "uncertaintyHandling", label: "Uncertainty handling", weight: 15 },
  { key: "hallucinationAvoidance", label: "Hallucination avoidance", weight: 15 },
  { key: "recommendationQuality", label: "Recommendation quality", weight: 20 },
  { key: "confidenceJustification", label: "Confidence justification", weight: 15 },
];

export const SCORING_TOTAL = SCORING_RUBRIC.reduce((total, item) => total + item.weight, 0);
