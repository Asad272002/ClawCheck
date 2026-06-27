import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/server";
import type {
  SemanticCoverageCheck,
  SemanticSuggestion,
  SemanticSuggestionPriority,
  WorkspaceSemanticAnalytics,
  WorkspaceSemanticTheme,
} from "@/lib/types";

type WorkspaceSemanticReportRow = {
  id: string;
  workspace_id: string;
  created_at: string;
  semantic_coverage: {
    totalChecks: number;
    coveredCount: number;
    partialCount: number;
    missedCount: number;
    coverageRatio: number;
    checks: SemanticCoverageCheck[];
  } | null;
  semantic_suggestions: SemanticSuggestion[] | null;
  semantic_summary: string | null;
};

type WorkspaceSemanticAnalyticsRow = {
  id: number;
  workspace_id: string;
  semantic_report_count: number;
  average_semantic_coverage: number;
  total_expected_checks: number;
  covered_checks: number;
  partial_checks: number;
  missed_checks: number;
  most_common_missed_check: string | null;
  most_common_partial_check: string | null;
  top_suggestion_title: string | null;
  top_suggestion_priority: SemanticSuggestionPriority | null;
  repeated_semantic_themes: WorkspaceSemanticTheme[] | null;
  latest_semantic_report_id: string | null;
  latest_semantic_summary: string | null;
  generated_at: string;
  updated_at: string;
};

type WorkspaceSemanticAnalyticsWriteRow = {
  workspace_id: string;
  semantic_report_count: number;
  average_semantic_coverage: number;
  total_expected_checks: number;
  covered_checks: number;
  partial_checks: number;
  missed_checks: number;
  most_common_missed_check: string | null;
  most_common_partial_check: string | null;
  top_suggestion_title: string | null;
  top_suggestion_priority: SemanticSuggestionPriority | null;
  repeated_semantic_themes: WorkspaceSemanticTheme[];
  latest_semantic_report_id: string | null;
  latest_semantic_summary: string | null;
  updated_at: string;
};

type RebuildWorkspaceSemanticAnalyticsOptions = {
  workspaceId?: string;
  includeEmpty?: boolean;
};

type RebuildWorkspaceSemanticAnalyticsReport = {
  processedWorkspaces: number;
  upsertedWorkspaces: number;
  deletedWorkspaces: number;
  results: Array<{
    workspaceId: string;
    status: "upserted" | "deleted" | "skipped";
    semanticReportCount: number;
  }>;
};

function getMutableAdmin() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getSupabaseAdmin() as any;
}

function countLabels(
  checks: SemanticCoverageCheck[],
  status: "missed" | "partial"
) {
  const counts = new Map<string, number>();

  for (const check of checks) {
    if (check.status !== status) {
      continue;
    }

    const label = check.label.trim();

    if (!label) {
      continue;
    }

    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return counts;
}

function findMostCommonLabel(counts: Map<string, number>) {
  return [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? null;
}

function buildRepeatedThemes(
  reports: WorkspaceSemanticReportRow[]
): WorkspaceSemanticTheme[] {
  const counts = new Map<string, WorkspaceSemanticTheme>();

  for (const report of reports) {
    const checks = report.semantic_coverage?.checks ?? [];

    for (const check of checks) {
      if (check.status !== "missed" && check.status !== "partial") {
        continue;
      }

      const key = `${check.status}:${check.label.trim()}`;

      if (!check.label.trim()) {
        continue;
      }

      const existing = counts.get(key);

      if (existing) {
        existing.count += 1;
        continue;
      }

      counts.set(key, {
        label: check.label.trim(),
        count: 1,
        status: check.status,
      });
    }

    for (const suggestion of report.semantic_suggestions ?? []) {
      const label = suggestion.relatedCheckLabel.trim();

      if (!label) {
        continue;
      }

      const key = `suggestion:${label}`;
      const existing = counts.get(key);

      if (existing) {
        existing.count += 1;
        continue;
      }

      counts.set(key, {
        label,
        count: 1,
        status: "suggestion",
      });
    }
  }

  return [...counts.values()].sort((left, right) => right.count - left.count).slice(0, 8);
}

function selectTopSuggestion(reports: WorkspaceSemanticReportRow[]) {
  const priorityOrder: Record<SemanticSuggestionPriority, number> = {
    high: 3,
    medium: 2,
    low: 1,
  };

  return reports
    .flatMap((report) =>
      (report.semantic_suggestions ?? []).map((suggestion) => ({
        suggestion,
        createdAt: report.created_at,
      }))
    )
    .sort((left, right) => {
      const priorityDelta = priorityOrder[right.suggestion.priority] - priorityOrder[left.suggestion.priority];

      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    })[0]?.suggestion ?? null;
}

function mapWorkspaceSemanticAnalytics(row: WorkspaceSemanticAnalyticsRow): WorkspaceSemanticAnalytics {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    semanticReportCount: row.semantic_report_count,
    averageSemanticCoverage: Number(row.average_semantic_coverage ?? 0),
    totalExpectedChecks: row.total_expected_checks,
    coveredChecks: row.covered_checks,
    partialChecks: row.partial_checks,
    missedChecks: row.missed_checks,
    mostCommonMissedCheck: row.most_common_missed_check,
    mostCommonPartialCheck: row.most_common_partial_check,
    topSuggestionTitle: row.top_suggestion_title,
    topSuggestionPriority: row.top_suggestion_priority,
    repeatedSemanticThemes: row.repeated_semantic_themes ?? [],
    latestSemanticReportId: row.latest_semantic_report_id,
    latestSemanticSummary: row.latest_semantic_summary,
    generatedAt: row.generated_at,
    updatedAt: row.updated_at,
  };
}

export async function buildWorkspaceSemanticAnalytics(
  workspaceId: string
): Promise<WorkspaceSemanticAnalyticsWriteRow | null> {
  const normalizedWorkspaceId = workspaceId.trim();

  if (!normalizedWorkspaceId) {
    throw new Error("Workspace semantic analytics require a workspace ID.");
  }

  const { data, error } = await getMutableAdmin()
    .from("reports")
    .select("id, workspace_id, created_at, semantic_coverage, semantic_suggestions, semantic_summary")
    .eq("workspace_id", normalizedWorkspaceId)
    .not("semantic_coverage", "is", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load workspace semantic reports: ${error.message}`);
  }

  const reports = (data ?? []) as WorkspaceSemanticReportRow[];

  if (reports.length === 0) {
    return null;
  }

  const totalExpectedChecks = reports.reduce((total, report) => total + (report.semantic_coverage?.totalChecks ?? 0), 0);
  const coveredChecks = reports.reduce((total, report) => total + (report.semantic_coverage?.coveredCount ?? 0), 0);
  const partialChecks = reports.reduce((total, report) => total + (report.semantic_coverage?.partialCount ?? 0), 0);
  const missedChecks = reports.reduce((total, report) => total + (report.semantic_coverage?.missedCount ?? 0), 0);
  const averageSemanticCoverage =
    reports.reduce((total, report) => total + (report.semantic_coverage?.coverageRatio ?? 0), 0) / reports.length;

  const missedCounts = new Map<string, number>();
  const partialCounts = new Map<string, number>();

  for (const report of reports) {
    const checks = report.semantic_coverage?.checks ?? [];

    for (const [label, count] of countLabels(checks, "missed")) {
      missedCounts.set(label, (missedCounts.get(label) ?? 0) + count);
    }

    for (const [label, count] of countLabels(checks, "partial")) {
      partialCounts.set(label, (partialCounts.get(label) ?? 0) + count);
    }
  }

  const latestReport = reports[0];
  const topSuggestion = selectTopSuggestion(reports);
  const timestamp = new Date().toISOString();

  return {
    workspace_id: normalizedWorkspaceId,
    semantic_report_count: reports.length,
    average_semantic_coverage: Number(averageSemanticCoverage.toFixed(5)),
    total_expected_checks: totalExpectedChecks,
    covered_checks: coveredChecks,
    partial_checks: partialChecks,
    missed_checks: missedChecks,
    most_common_missed_check: findMostCommonLabel(missedCounts),
    most_common_partial_check: findMostCommonLabel(partialCounts),
    top_suggestion_title: topSuggestion?.title ?? null,
    top_suggestion_priority: topSuggestion?.priority ?? null,
    repeated_semantic_themes: buildRepeatedThemes(reports),
    latest_semantic_report_id: latestReport?.id ?? null,
    latest_semantic_summary: latestReport?.semantic_summary ?? null,
    updated_at: timestamp,
  };
}

export async function upsertWorkspaceSemanticAnalytics(workspaceId: string) {
  const analytics = await buildWorkspaceSemanticAnalytics(workspaceId);

  if (!analytics) {
    const { error } = await getMutableAdmin()
      .from("workspace_semantic_analytics")
      .delete()
      .eq("workspace_id", workspaceId);

    if (error) {
      throw new Error(`Unable to clear workspace semantic analytics: ${error.message}`);
    }

    return null;
  }

  const { data, error } = await getMutableAdmin()
    .from("workspace_semantic_analytics")
    .upsert(analytics, {
      onConflict: "workspace_id",
    })
    .select(
      "id, workspace_id, semantic_report_count, average_semantic_coverage, total_expected_checks, covered_checks, partial_checks, missed_checks, most_common_missed_check, most_common_partial_check, top_suggestion_title, top_suggestion_priority, repeated_semantic_themes, latest_semantic_report_id, latest_semantic_summary, generated_at, updated_at"
    )
    .single();

  if (error) {
    throw new Error(`Unable to persist workspace semantic analytics: ${error.message}`);
  }

  return mapWorkspaceSemanticAnalytics(data as WorkspaceSemanticAnalyticsRow);
}

export async function rebuildWorkspaceSemanticAnalytics(
  options: RebuildWorkspaceSemanticAnalyticsOptions = {}
): Promise<RebuildWorkspaceSemanticAnalyticsReport> {
  const normalizedWorkspaceId = options.workspaceId?.trim();
  let workspaceIds: string[] = [];

  if (normalizedWorkspaceId) {
    workspaceIds = [normalizedWorkspaceId];
  } else {
    const { data, error } = await getMutableAdmin()
      .from("workspaces")
      .select("id")
      .order("id");

    if (error) {
      throw new Error(`Unable to load workspaces for semantic analytics rebuild: ${error.message}`);
    }

    workspaceIds = (data ?? []).map((row: { id: string }) => row.id);
  }

  const results: RebuildWorkspaceSemanticAnalyticsReport["results"] = [];
  let upsertedWorkspaces = 0;
  let deletedWorkspaces = 0;

  for (const workspaceId of workspaceIds) {
    const analytics = await buildWorkspaceSemanticAnalytics(workspaceId);

    if (!analytics) {
      if (options.includeEmpty) {
        const { error } = await getMutableAdmin()
          .from("workspace_semantic_analytics")
          .delete()
          .eq("workspace_id", workspaceId);

        if (error) {
          throw new Error(`Unable to clear workspace semantic analytics for ${workspaceId}: ${error.message}`);
        }
      }

      deletedWorkspaces += 1;
      results.push({
        workspaceId,
        status: options.includeEmpty ? "deleted" : "skipped",
        semanticReportCount: 0,
      });
      continue;
    }

    await upsertWorkspaceSemanticAnalytics(workspaceId);
    upsertedWorkspaces += 1;
    results.push({
      workspaceId,
      status: "upserted",
      semanticReportCount: analytics.semantic_report_count,
    });
  }

  return {
    processedWorkspaces: workspaceIds.length,
    upsertedWorkspaces,
    deletedWorkspaces,
    results,
  };
}

export async function loadWorkspaceSemanticAnalyticsMap() {
  const supabase = await createReadableWorkspaceSemanticAnalyticsClient();
  const { data, error } = await supabase
    .from("workspace_semantic_analytics")
    .select(
      "id, workspace_id, semantic_report_count, average_semantic_coverage, total_expected_checks, covered_checks, partial_checks, missed_checks, most_common_missed_check, most_common_partial_check, top_suggestion_title, top_suggestion_priority, repeated_semantic_themes, latest_semantic_report_id, latest_semantic_summary, generated_at, updated_at"
    );

  if (error) {
    throw new Error(`Unable to load workspace semantic analytics: ${error.message}`);
  }

  return new Map(
    ((data ?? []) as WorkspaceSemanticAnalyticsRow[]).map((row) => [row.workspace_id, mapWorkspaceSemanticAnalytics(row)])
  );
}

async function createReadableWorkspaceSemanticAnalyticsClient() {
  const { createSupabaseServerClient } = await import("@/lib/supabase/ssr");
  return createSupabaseServerClient();
}
