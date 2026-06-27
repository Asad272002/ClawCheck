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

export type SemanticSuggestionPriority = "high" | "medium" | "low";
export type SemanticSuggestionType =
  | "missing_expected_check"
  | "partial_expected_check"
  | "confidence_gap"
  | "verification_gap"
  | "stakeholder_gap"
  | "recommendation_gap";

export type SemanticCoverageStatus = "covered" | "partial" | "missed";

export type SemanticCoverageCheck = {
  expectedCheckId: number;
  label: string;
  status: SemanticCoverageStatus;
  similarity: number;
  bestMatchingChunk: string | null;
  explanation: string;
  suggestedImprovement: string | null;
};

export type SemanticSuggestion = {
  id: string;
  title: string;
  description: string;
  priority: SemanticSuggestionPriority;
  type: SemanticSuggestionType;
  relatedCheckLabel: string;
  reason: string;
  evidenceChunk: string | null;
  suggestedAction: string;
};

export type SimilarReportReference = {
  reportId: string;
  workspaceId: string | null;
  testCaseId: string | null;
  createdAt: string;
  agentName: string;
  category: string;
  finalScore: number;
  status: string;
  riskLevel: string;
  summary: string;
  similarity: number;
};

export type SemanticWorkspaceMemory = {
  repeatedThemes: string[];
  similarWorkspaceReports: SimilarReportReference[];
  improvementNotes: string[];
};

export type WorkspaceSemanticTheme = {
  label: string;
  count: number;
  status: "missed" | "partial" | "suggestion";
};

export type WorkspaceSemanticAnalytics = {
  id: number;
  workspaceId: string;
  semanticReportCount: number;
  averageSemanticCoverage: number;
  totalExpectedChecks: number;
  coveredChecks: number;
  partialChecks: number;
  missedChecks: number;
  mostCommonMissedCheck: string | null;
  mostCommonPartialCheck: string | null;
  topSuggestionTitle: string | null;
  topSuggestionPriority: SemanticSuggestionPriority | null;
  repeatedSemanticThemes: WorkspaceSemanticTheme[];
  latestSemanticReportId: string | null;
  latestSemanticSummary: string | null;
  generatedAt: string;
  updatedAt: string;
};

export type SemanticInsights = {
  semanticCoverage: {
    totalChecks: number;
    coveredCount: number;
    partialCount: number;
    missedCount: number;
    coverageRatio: number;
    checks: SemanticCoverageCheck[];
  };
  semanticSuggestions: SemanticSuggestion[];
  similarReports: SimilarReportReference[];
  workspaceMemory: SemanticWorkspaceMemory | null;
  overallSemanticSummary: string;
};

export type EvaluationReport = EvaluationInput & {
  id: string;
  workspaceId?: string;
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
  semanticInsights?: SemanticInsights | null;
  semanticModel?: string | null;
  semanticGeneratedAt?: string | null;
  semanticWarning?: string | null;
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
  reportId?: string;
  versionId: string;
  versionLabel?: string;
  createdAt: string;
  category: EvaluationCategory;
  score: number;
  riskLevel: RiskLevel;
  status: EvaluationStatus;
  summary: string;
  weaknesses: string[];
  improvements: string[];
  hasSemanticInsights?: boolean;
  semanticCoverageRatio?: number | null;
  semanticCoveredCount?: number;
  semanticPartialCount?: number;
  semanticMissedCount?: number;
  semanticTotalChecks?: number;
  semanticTopSuggestionPriority?: SemanticSuggestionPriority | null;
  semanticTopSuggestionLabel?: string | null;
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
  agentType: string;
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
  semanticAnalytics?: WorkspaceSemanticAnalytics | null;
};
