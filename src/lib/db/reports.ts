import type { CategoryScores, ConfidenceQuality, EvaluationCategory, EvaluationReport, EvaluationStatus, RiskLevel } from "@/lib/types";
import { createSupabaseServerClient } from "@/lib/supabase/ssr";

type ReportRow = {
  id: string;
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
};

type PersistReportOptions = {
  source?: "seeded" | "generated";
  testCaseId?: string | null;
  workspaceId?: string | null;
  evaluationId?: string | null;
  createdBy?: string | null;
};

function mapReport(row: ReportRow): EvaluationReport {
  return {
    id: row.id,
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
  };
}

export async function getReports() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reports")
    .select(
      "id, created_at, agent_name, agent_purpose, agent_type, category, test_prompt, agent_response, final_score, status, risk_level, category_scores, strengths, weaknesses, missing_risks, recommendations, confidence_quality, summary"
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load reports: ${error.message}`);
  }

  return (data ?? []).map((row) => mapReport(row as ReportRow));
}

export async function getReportById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reports")
    .select(
      "id, created_at, agent_name, agent_purpose, agent_type, category, test_prompt, agent_response, final_score, status, risk_level, category_scores, strengths, weaknesses, missing_risks, recommendations, confidence_quality, summary"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load report ${id}: ${error.message}`);
  }

  return data ? mapReport(data as ReportRow) : null;
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

  return report;
}
