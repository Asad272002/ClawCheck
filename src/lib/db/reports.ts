import type {
  CategoryScores,
  ConfidenceQuality,
  EvaluationCategory,
  EvaluationReport,
  EvaluationStatus,
  RiskLevel,
  SemanticInsights,
} from "@/lib/types";
import { getEmbeddingConfig } from "@/lib/semantic/embeddings";
import { upsertWorkspaceSemanticAnalytics } from "@/lib/semantic/workspace-analytics";
import { createSupabaseServerClient } from "@/lib/supabase/ssr";

type ReportRow = {
  id: string;
  workspace_id: string | null;
  created_at: string;
  agent_name: string;
  agent_purpose: string;
  agent_type: string;
  category: EvaluationCategory;
  test_prompt: string;
  agent_response: string;
  final_score: number;
  status: EvaluationStatus;
  risk_level: RiskLevel;
  category_scores: CategoryScores;
  strengths: string[] | null;
  weaknesses: string[] | null;
  missing_risks: string[] | null;
  recommendations: string[] | null;
  confidence_quality: ConfidenceQuality;
  summary: string;
  semantic_coverage: SemanticInsights["semanticCoverage"] | null;
  semantic_suggestions: SemanticInsights["semanticSuggestions"] | null;
  semantic_similar_reports: SemanticInsights["similarReports"] | null;
  semantic_workspace_memory: SemanticInsights["workspaceMemory"] | null;
  semantic_summary: string | null;
  semantic_model: string | null;
  semantic_generated_at: string | null;
};

type PersistReportOptions = {
  source?: "seeded" | "generated";
  testCaseId?: string | null;
  workspaceId?: string | null;
  evaluationId?: string | null;
  createdBy?: string | null;
  semanticInsights?: SemanticInsights | null;
};

type SemanticReportPersistencePayload = {
  semantic_coverage: SemanticInsights["semanticCoverage"];
  semantic_suggestions: SemanticInsights["semanticSuggestions"];
  semantic_similar_reports: SemanticInsights["similarReports"];
  semantic_workspace_memory: SemanticInsights["workspaceMemory"];
  semantic_summary: string;
  semantic_model: string | null;
  semantic_generated_at: string;
};

const REPORT_SELECT_FIELDS = [
  "id",
  "workspace_id",
  "created_at",
  "agent_name",
  "agent_purpose",
  "agent_type",
  "category",
  "test_prompt",
  "agent_response",
  "final_score",
  "status",
  "risk_level",
  "category_scores",
  "strengths",
  "weaknesses",
  "missing_risks",
  "recommendations",
  "confidence_quality",
  "summary",
  "semantic_coverage",
  "semantic_suggestions",
  "semantic_similar_reports",
  "semantic_workspace_memory",
  "semantic_summary",
  "semantic_model",
  "semantic_generated_at",
].join(", ");

function buildSemanticInsights(row: ReportRow): SemanticInsights | null {
  if (!row.semantic_coverage || !row.semantic_suggestions || !row.semantic_similar_reports || !row.semantic_summary) {
    return null;
  }

  return {
    semanticCoverage: row.semantic_coverage,
    semanticSuggestions: row.semantic_suggestions,
    similarReports: row.semantic_similar_reports,
    workspaceMemory: row.semantic_workspace_memory,
    overallSemanticSummary: row.semantic_summary,
  };
}

function buildSemanticPersistencePayload(semanticInsights: SemanticInsights): SemanticReportPersistencePayload {
  let semanticModel: string | null = null;

  try {
    semanticModel = getEmbeddingConfig().model;
  } catch {
    semanticModel = null;
  }

  return {
    semantic_coverage: semanticInsights.semanticCoverage,
    semantic_suggestions: semanticInsights.semanticSuggestions,
    semantic_similar_reports: semanticInsights.similarReports,
    semantic_workspace_memory: semanticInsights.workspaceMemory,
    semantic_summary: semanticInsights.overallSemanticSummary,
    semantic_model: semanticModel,
    semantic_generated_at: new Date().toISOString(),
  };
}

function mapReport(row: ReportRow): EvaluationReport {
  return {
    id: row.id,
    workspaceId: row.workspace_id ?? undefined,
    createdAt: row.created_at,
    agentName: row.agent_name,
    agentPurpose: row.agent_purpose,
    agentType: row.agent_type,
    category: row.category,
    testPrompt: row.test_prompt,
    agentResponse: row.agent_response,
    finalScore: row.final_score,
    status: row.status,
    riskLevel: row.risk_level,
    categoryScores: row.category_scores,
    strengths: row.strengths ?? [],
    weaknesses: row.weaknesses ?? [],
    missingRisks: row.missing_risks ?? [],
    recommendations: row.recommendations ?? [],
    confidenceQuality: row.confidence_quality,
    summary: row.summary,
    semanticInsights: buildSemanticInsights(row),
    semanticModel: row.semantic_model,
    semanticGeneratedAt: row.semantic_generated_at,
  };
}

export async function getReports() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reports")
    .select(REPORT_SELECT_FIELDS)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load reports: ${error.message}`);
  }

  return (data ?? []).map((row) => mapReport(row as unknown as ReportRow));
}

export async function getReportById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reports")
    .select(REPORT_SELECT_FIELDS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load report ${id}: ${error.message}`);
  }

  return data ? mapReport(data as unknown as ReportRow) : null;
}

export async function getWorkspaceScopedReports() {
  const reports = await getReports();
  return reports.filter((report) => report.workspaceId);
}

export async function persistReport(report: EvaluationReport, options: PersistReportOptions = {}) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("reports").insert({
    id: report.id,
    workspace_id: options.workspaceId ?? null,
    evaluation_id: options.evaluationId ?? null,
    test_case_id: options.testCaseId ?? null,
    created_at: report.createdAt,
    agent_name: report.agentName,
    agent_purpose: report.agentPurpose,
    agent_type: report.agentType,
    category: report.category,
    test_prompt: report.testPrompt,
    agent_response: report.agentResponse,
    final_score: report.finalScore,
    status: report.status,
    risk_level: report.riskLevel,
    category_scores: report.categoryScores,
    strengths: report.strengths,
    weaknesses: report.weaknesses,
    missing_risks: report.missingRisks,
    recommendations: report.recommendations,
    confidence_quality: report.confidenceQuality,
    summary: report.summary,
    source: options.source ?? "generated",
    created_by: options.createdBy ?? null,
  });

  if (error) {
    throw new Error(`Unable to save report: ${error.message}`);
  }

  if (options.semanticInsights) {
    const semanticPayload = buildSemanticPersistencePayload(options.semanticInsights);
    const { error: semanticError } = await supabase
      .from("reports")
      .update(semanticPayload)
      .eq("id", report.id);

    if (semanticError) {
      console.error(`Semantic insights could not be saved for report ${report.id}:`, semanticError);
      return report;
    }

    if (options.workspaceId) {
      try {
        await upsertWorkspaceSemanticAnalytics(options.workspaceId);
      } catch (workspaceSemanticAnalyticsError) {
        console.error(
          `Workspace semantic analytics could not be updated for workspace ${options.workspaceId}:`,
          workspaceSemanticAnalyticsError
        );
      }
    }
  }

  return report;
}
