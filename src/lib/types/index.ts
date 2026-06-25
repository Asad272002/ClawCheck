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

export type TestCase = {
  id: string;
  category: EvaluationCategory;
  title: string;
  prompt: string;
  expectedChecks: string[];
  difficulty: Difficulty;
};

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
  workspaceId?: string;
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

export type WorkspaceHealth = "Improving" | "Needs attention" | "Stable";
export type RecommendationImpact = "High" | "Medium" | "Low";
export type WeaknessTrend = "Improving" | "Persistent" | "Worsening";

export type AgentWorkspaceVersion = {
  id: string;
  label: string;
  releasedAt: string;
  summary: string;
  safetyScore: number;
  evaluationCount: number;
  promptCoverage: number;
  focusAreas: string[];
};

export type WorkspaceEvaluationRun = {
  id: string;
  versionId: string;
  createdAt: string;
  category: EvaluationCategory;
  score: number;
  riskLevel: RiskLevel;
  status: EvaluationStatus;
  summary: string;
  weaknesses: string[];
  improvements: string[];
};

export type WorkspaceWeaknessInsight = {
  label: string;
  count: number;
  lastSeen: string;
  trend: WeaknessTrend;
  severity: RiskLevel;
};

export type WorkspaceRecommendation = {
  id: string;
  title: string;
  description: string;
  impact: RecommendationImpact;
  targetVersion: string;
};

export type WorkspaceMemberRole = "owner" | "member";

export type WorkspaceMember = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: WorkspaceMemberRole;
  joinedAt: string;
};

export type WorkspaceMemberCandidate = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
};

export type AgentWorkspace = {
  id: string;
  slug: string;
  name: string;
  agentName: string;
  purpose: string;
  description: string;
  owner: string;
  ownerUserId: string | null;
  team: string;
  health: WorkspaceHealth;
  primaryGoal: string;
  lastUpdated: string;
  tags: string[];
  versions: AgentWorkspaceVersion[];
  evaluations: WorkspaceEvaluationRun[];
  repeatedWeaknesses: WorkspaceWeaknessInsight[];
  nextRecommendations: WorkspaceRecommendation[];
};
