import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/server";

import {
  classifySemanticCoverageForTestCase,
  type SemanticCoverageCheckResult,
  type SemanticCoverageResult,
} from "./coverage";
import {
  findSimilarReports,
  findWorkspaceSemanticHistory,
  type SimilarReportMatch,
} from "./retrieval";

export type SemanticSuggestionPriority = "high" | "medium" | "low";
export type SemanticSuggestionType =
  | "missing_expected_check"
  | "partial_expected_check"
  | "confidence_gap"
  | "verification_gap"
  | "stakeholder_gap"
  | "recommendation_gap";

export type SemanticSuggestionItem = {
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

export type SemanticWorkspaceMemory = {
  repeatedThemes: string[];
  similarWorkspaceReports: SimilarReportMatch[];
  improvementNotes: string[];
};

export type SemanticSuggestionPayload = {
  semanticCoverage: {
    totalChecks: number;
    coveredCount: number;
    partialCount: number;
    missedCount: number;
    coverageRatio: number;
    checks: SemanticCoverageCheckResult[];
  };
  semanticSuggestions: SemanticSuggestionItem[];
  similarReports: SimilarReportMatch[];
  workspaceMemory: SemanticWorkspaceMemory | null;
  overallSemanticSummary: string;
};

export type ComposeSemanticSuggestionsOptions = {
  testCaseId?: string;
  agentResponse?: string;
  workspaceId?: string;
  category?: string;
  reportId?: string;
  deterministicScore?: number;
  deterministicStatus?: string;
  deterministicRiskLevel?: string;
};

type ReportPreviewContext = {
  testCaseId: string;
  agentResponse: string;
  workspaceId?: string;
  category?: string;
  deterministicScore?: number;
  deterministicStatus?: string;
  deterministicRiskLevel?: string;
};

type WorkspaceWeaknessRow = {
  label: string;
  count: number;
};

function getMutableAdmin() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getSupabaseAdmin() as any;
}

function normalizeLabel(label: string) {
  return label.trim().toLowerCase();
}

function classifySuggestionType(check: SemanticCoverageCheckResult): SemanticSuggestionType {
  const normalized = normalizeLabel(check.label);

  if (normalized.includes("confidence")) {
    return "confidence_gap";
  }

  if (
    normalized.includes("source") ||
    normalized.includes("verification") ||
    normalized.includes("citation")
  ) {
    return "verification_gap";
  }

  if (
    normalized.includes("stakeholder") ||
    normalized.includes("oversight") ||
    normalized.includes("human")
  ) {
    return "stakeholder_gap";
  }

  if (
    normalized.includes("recommend") ||
    normalized.includes("improvement") ||
    normalized.includes("action")
  ) {
    return "recommendation_gap";
  }

  return check.status === "missed" ? "missing_expected_check" : "partial_expected_check";
}

function classifySuggestionPriority(check: SemanticCoverageCheckResult): SemanticSuggestionPriority {
  if (check.status === "missed") {
    return "high";
  }

  if (check.similarity < 0.45) {
    return "medium";
  }

  return "low";
}

function buildSuggestionTitle(check: SemanticCoverageCheckResult, type: SemanticSuggestionType) {
  if (type === "verification_gap") {
    return `Add stronger verification for ${check.label}`;
  }

  if (type === "confidence_gap") {
    return `Clarify confidence around ${check.label}`;
  }

  if (type === "stakeholder_gap") {
    return `Strengthen stakeholder handling for ${check.label}`;
  }

  if (type === "recommendation_gap") {
    return `Make the action clearer for ${check.label}`;
  }

  return check.status === "missed" ? `Cover missing check: ${check.label}` : `Expand partial check: ${check.label}`;
}

function buildSuggestionDescription(check: SemanticCoverageCheckResult) {
  if (check.status === "missed") {
    return `The response does not yet provide clear semantic coverage for "${check.label}".`;
  }

  return `The response touches "${check.label}", but the current wording is still too indirect or incomplete.`;
}

function buildSuggestionReason(check: SemanticCoverageCheckResult) {
  return `Best semantic match scored ${check.similarity.toFixed(2)} for "${check.label}".`;
}

function buildSuggestedAction(check: SemanticCoverageCheckResult) {
  if (check.suggestedImprovement) {
    return check.suggestedImprovement;
  }

  return `Keep the current handling for "${check.label}" and preserve its explicit wording.`;
}

function buildSuggestionId(check: SemanticCoverageCheckResult, index: number) {
  return `semantic-suggestion:${check.expectedCheckId}:${index}`;
}

function dedupeReports(reports: SimilarReportMatch[]) {
  const seen = new Set<string>();
  const deduped: SimilarReportMatch[] = [];

  for (const report of reports) {
    if (seen.has(report.reportId)) {
      continue;
    }

    seen.add(report.reportId);
    deduped.push(report);
  }

  return deduped;
}

async function loadReportContext(reportId: string) {
  const normalizedReportId = reportId.trim();

  if (!normalizedReportId) {
    throw new Error("Semantic suggestion preview requires a report ID.");
  }

  const { data, error } = await getMutableAdmin()
    .from("reports")
    .select("id, test_case_id, workspace_id, category, agent_response, final_score, status, risk_level")
    .eq("id", normalizedReportId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load report context: ${error.message}`);
  }

  if (!data) {
    throw new Error(`Report "${normalizedReportId}" was not found.`);
  }

  const report = data as {
    test_case_id: string | null;
    workspace_id: string | null;
    category: string | null;
    agent_response: string | null;
    final_score: number | null;
    status: string | null;
    risk_level: string | null;
  };

  if (!report.test_case_id || !report.agent_response) {
    throw new Error(`Report "${normalizedReportId}" is missing the test case link or agent response.`);
  }

  return {
    testCaseId: report.test_case_id,
    agentResponse: report.agent_response,
    workspaceId: report.workspace_id ?? undefined,
    category: report.category ?? undefined,
    deterministicScore: report.final_score ?? undefined,
    deterministicStatus: report.status ?? undefined,
    deterministicRiskLevel: report.risk_level ?? undefined,
  } satisfies ReportPreviewContext;
}

function toCoverageShape(coverage: SemanticCoverageResult) {
  return {
    totalChecks: coverage.totalChecks,
    coveredCount: coverage.coveredCount,
    partialCount: coverage.partialCount,
    missedCount: coverage.missedCount,
    coverageRatio: coverage.coverageRatio,
    checks: coverage.checks,
  };
}

function buildSuggestionsFromCoverage(coverage: SemanticCoverageResult) {
  return coverage.checks
    .filter((check) => check.status !== "covered")
    .sort((left, right) => left.similarity - right.similarity)
    .map((check, index) => {
      const type = classifySuggestionType(check);

      return {
        id: buildSuggestionId(check, index),
        title: buildSuggestionTitle(check, type),
        description: buildSuggestionDescription(check),
        priority: classifySuggestionPriority(check),
        type,
        relatedCheckLabel: check.label,
        reason: buildSuggestionReason(check),
        evidenceChunk: check.bestMatchingChunk,
        suggestedAction: buildSuggestedAction(check),
      } satisfies SemanticSuggestionItem;
    });
}

async function loadWorkspaceMemory(options: {
  workspaceId?: string;
  agentResponse: string;
  category?: string;
}) {
  if (!options.workspaceId) {
    return null;
  }

  const similarWorkspaceReports = await findWorkspaceSemanticHistory({
    workspaceId: options.workspaceId,
    responseText: options.agentResponse,
    limit: 3,
    filters: options.category ? { category: options.category } : undefined,
  });

  const { data, error } = await getMutableAdmin()
    .from("workspace_weakness_insights")
    .select("label, count")
    .eq("workspace_id", options.workspaceId)
    .order("count", { ascending: false })
    .limit(3);

  if (error) {
    throw new Error(`Unable to load workspace weakness memory: ${error.message}`);
  }

  const repeatedThemes = ((data ?? []) as WorkspaceWeaknessRow[]).map((row) => row.label);
  const improvementNotes: string[] = [];

  if (similarWorkspaceReports.length > 0) {
    const lowPerformers = similarWorkspaceReports.filter(
      (report) => report.finalScore < 60 || report.status.toLowerCase() === "fail"
    );

    if (lowPerformers.length > 0) {
      improvementNotes.push(
        `This workspace has ${lowPerformers.length} semantically similar low-performing report${lowPerformers.length === 1 ? "" : "s"} worth reviewing before the next iteration.`
      );
    } else {
      improvementNotes.push("Recent workspace history includes semantically similar runs that can be reused as style references.");
    }
  }

  if (repeatedThemes.length > 0) {
    improvementNotes.push(`Recurring workspace themes include ${repeatedThemes.join(", ")}.`);
  }

  return {
    repeatedThemes,
    similarWorkspaceReports,
    improvementNotes,
  } satisfies SemanticWorkspaceMemory;
}

function buildOverallSemanticSummary(options: {
  coverage: SemanticCoverageResult;
  suggestionCount: number;
  similarReports: SimilarReportMatch[];
  workspaceMemory: SemanticWorkspaceMemory | null;
  deterministicScore?: number;
}) {
  const summaryParts = [options.coverage.overallSummary];

  if (typeof options.deterministicScore === "number") {
    summaryParts.push(`Deterministic score context: ${options.deterministicScore}.`);
  }

  if (options.suggestionCount > 0) {
    summaryParts.push(`${options.suggestionCount} semantic suggestion${options.suggestionCount === 1 ? "" : "s"} were generated from partial or missed checks.`);
  }

  if (options.similarReports.length > 0) {
    const strongest = options.similarReports[0];
    summaryParts.push(
      `Closest prior report similarity is ${strongest.similarity.toFixed(2)} (${strongest.status}, score ${strongest.finalScore}).`
    );
  }

  if (options.workspaceMemory && options.workspaceMemory.repeatedThemes.length > 0) {
    summaryParts.push(`Workspace memory shows repeated themes around ${options.workspaceMemory.repeatedThemes.join(", ")}.`);
  }

  return summaryParts.join(" ");
}

export async function composeSemanticSuggestions(options: ComposeSemanticSuggestionsOptions) {
  const context = options.reportId ? await loadReportContext(options.reportId) : null;
  const testCaseId = (context?.testCaseId ?? options.testCaseId ?? "").trim();
  const agentResponse = (context?.agentResponse ?? options.agentResponse ?? "").trim();
  const workspaceId = context?.workspaceId ?? options.workspaceId;
  const category = context?.category ?? options.category;
  const deterministicScore = context?.deterministicScore ?? options.deterministicScore;

  if (!testCaseId) {
    throw new Error("Semantic suggestion composition requires a test case ID or report ID.");
  }

  if (!agentResponse) {
    throw new Error("Semantic suggestion composition requires an agent response or report ID.");
  }

  const coverage = await classifySemanticCoverageForTestCase({
    testCaseId,
    agentResponse,
    workspaceId,
    category,
  });

  const [generalSimilarReports, highPerformingReports, lowPerformingReports, workspaceMemory] = await Promise.all([
    findSimilarReports({
      responseText: agentResponse,
      limit: 4,
      filters: category ? { category } : undefined,
    }),
    findSimilarReports({
      responseText: agentResponse,
      limit: 2,
      filters: {
        ...(category ? { category } : {}),
        minScore: 80,
      },
    }),
    findSimilarReports({
      responseText: agentResponse,
      limit: 2,
      filters: {
        ...(category ? { category } : {}),
        maxScore: 59,
      },
    }),
    loadWorkspaceMemory({
      workspaceId,
      agentResponse,
      category,
    }),
  ]);

  const semanticSuggestions = buildSuggestionsFromCoverage(coverage);
  const similarReports = dedupeReports([
    ...generalSimilarReports,
    ...highPerformingReports,
    ...lowPerformingReports,
  ]).slice(0, 6);

  return {
    semanticCoverage: toCoverageShape(coverage),
    semanticSuggestions,
    similarReports,
    workspaceMemory,
    overallSemanticSummary: buildOverallSemanticSummary({
      coverage,
      suggestionCount: semanticSuggestions.length,
      similarReports,
      workspaceMemory,
      deterministicScore,
    }),
  } satisfies SemanticSuggestionPayload;
}
