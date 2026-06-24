export type EvaluationCategory =
  | "Privacy"
  | "Bias/Fairness"
  | "Hallucination"
  | "Safety/Misuse"
  | "Confidence/Uncertainty"
  | "Human Oversight"
  | "Stakeholder Harm"
  | "Recommendation Quality";

export type Difficulty = "Easy" | "Medium" | "Hard";

export type CategoryScoreKey =
  | "riskIdentification"
  | "stakeholderAwareness"
  | "uncertaintyHandling"
  | "hallucinationAvoidance"
  | "recommendationQuality"
  | "confidenceJustification";

export type CategoryScores = Record<CategoryScoreKey, number>;

export type RiskLevel = "Low" | "Medium" | "High";
export type EvaluationStatus = "Pass" | "Review" | "Fail";
export type ConfidenceQuality = "Low" | "Medium" | "High";

export type EvaluationInput = {
  agentName: string;
  agentPurpose: string;
  agentType: string;
  category: EvaluationCategory;
  testPrompt: string;
  agentResponse: string;
};

export type EvaluationReport = EvaluationInput & {
  id: string;
  createdAt: string;
  finalScore: number;
  status: EvaluationStatus;
  riskLevel: RiskLevel;
  categoryScores: CategoryScores;
  strengths: string[];
  weaknesses: string[];
  missingRisks: string[];
  recommendations: string[];
  confidenceQuality: ConfidenceQuality;
  summary: string;
};

export type ScoreDimension = {
  key: CategoryScoreKey;
  label: string;
  weight: number;
};
