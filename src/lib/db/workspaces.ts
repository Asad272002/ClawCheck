import type {
  AgentWorkspace,
  AgentWorkspaceVersion,
  RecommendationImpact,
  WorkspaceEvaluationRun,
  WorkspaceHealth,
  WorkspaceRecommendation,
  WorkspaceWeaknessInsight,
} from "@/lib/types";
import { createSupabaseServerClient } from "@/lib/supabase/ssr";

const HEALTH_ORDER: Record<WorkspaceHealth, number> = {
  Improving: 3,
  Stable: 2,
  "Needs attention": 1,
};

const IMPACT_ORDER: Record<RecommendationImpact, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

type WorkspaceRow = {
  id: string;
  slug: string;
  name: string;
  agent_name: string;
  purpose: string;
  description: string;
  owner_name: string;
  team: string;
  health: WorkspaceHealth;
  primary_goal: string;
  last_updated: string;
  tags: string[] | null;
};

type WorkspaceVersionRow = {
  id: string;
  workspace_id: string;
  label: string;
  released_at: string;
  summary: string;
  safety_score: number;
  evaluation_count: number;
  prompt_coverage: number;
  focus_areas: string[] | null;
};

type WorkspaceEvaluationRow = {
  id: string;
  workspace_id: string;
  version_id: string;
  created_at: string;
  category: WorkspaceEvaluationRun["category"];
  score: number;
  risk_level: WorkspaceEvaluationRun["riskLevel"];
  status: WorkspaceEvaluationRun["status"];
  summary: string;
  weaknesses: string[] | null;
  improvements: string[] | null;
};

type WorkspaceWeaknessRow = {
  workspace_id: string;
  label: string;
  count: number;
  last_seen: string;
  trend: WorkspaceWeaknessInsight["trend"];
  severity: WorkspaceWeaknessInsight["severity"];
};

type WorkspaceRecommendationRow = {
  id: string;
  workspace_id: string;
  title: string;
  description: string;
  impact: WorkspaceRecommendation["impact"];
  target_version: string;
};

function mapVersion(row: WorkspaceVersionRow): AgentWorkspaceVersion {
  return {
    id: row.id,
    label: row.label,
    releasedAt: row.released_at,
    summary: row.summary,
    safetyScore: row.safety_score,
    evaluationCount: row.evaluation_count,
    promptCoverage: row.prompt_coverage,
    focusAreas: row.focus_areas ?? [],
  };
}

function mapEvaluation(row: WorkspaceEvaluationRow): WorkspaceEvaluationRun {
  return {
    id: row.id,
    versionId: row.version_id,
    createdAt: row.created_at,
    category: row.category,
    score: row.score,
    riskLevel: row.risk_level,
    status: row.status,
    summary: row.summary,
    weaknesses: row.weaknesses ?? [],
    improvements: row.improvements ?? [],
  };
}

function mapWeakness(row: WorkspaceWeaknessRow): WorkspaceWeaknessInsight {
  return {
    label: row.label,
    count: row.count,
    lastSeen: row.last_seen,
    trend: row.trend,
    severity: row.severity,
  };
}

function mapRecommendation(row: WorkspaceRecommendationRow): WorkspaceRecommendation {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    impact: row.impact,
    targetVersion: row.target_version,
  };
}

export async function fetchWorkspaces() {
  const supabase = await createSupabaseServerClient();
  const [workspaceResult, versionsResult, evaluationsResult, weaknessesResult, recommendationsResult] = await Promise.all([
    supabase
      .from("workspaces")
      .select("id, slug, name, agent_name, purpose, description, owner_name, team, health, primary_goal, last_updated, tags")
      .order("last_updated", { ascending: false }),
    supabase
      .from("workspace_versions")
      .select("id, workspace_id, label, released_at, summary, safety_score, evaluation_count, prompt_coverage, focus_areas")
      .order("released_at", { ascending: false }),
    supabase
      .from("workspace_evaluations")
      .select("id, workspace_id, version_id, created_at, category, score, risk_level, status, summary, weaknesses, improvements")
      .order("created_at", { ascending: false }),
    supabase
      .from("workspace_weakness_insights")
      .select("workspace_id, label, count, last_seen, trend, severity")
      .order("count", { ascending: false }),
    supabase
      .from("workspace_recommendations")
      .select("id, workspace_id, title, description, impact, target_version")
      .order("id"),
  ]);

  if (workspaceResult.error) {
    throw new Error(`Unable to load workspaces: ${workspaceResult.error.message}`);
  }
  if (versionsResult.error) {
    throw new Error(`Unable to load workspace versions: ${versionsResult.error.message}`);
  }
  if (evaluationsResult.error) {
    throw new Error(`Unable to load workspace evaluations: ${evaluationsResult.error.message}`);
  }
  if (weaknessesResult.error) {
    throw new Error(`Unable to load workspace weaknesses: ${weaknessesResult.error.message}`);
  }
  if (recommendationsResult.error) {
    throw new Error(`Unable to load workspace recommendations: ${recommendationsResult.error.message}`);
  }

  const versionsByWorkspace = new Map<string, AgentWorkspaceVersion[]>();
  for (const row of (versionsResult.data ?? []) as WorkspaceVersionRow[]) {
    const version = mapVersion(row);
    versionsByWorkspace.set(row.workspace_id, [...(versionsByWorkspace.get(row.workspace_id) ?? []), version]);
  }

  const evaluationsByWorkspace = new Map<string, WorkspaceEvaluationRun[]>();
  for (const row of (evaluationsResult.data ?? []) as WorkspaceEvaluationRow[]) {
    const evaluation = mapEvaluation(row);
    evaluationsByWorkspace.set(row.workspace_id, [...(evaluationsByWorkspace.get(row.workspace_id) ?? []), evaluation]);
  }

  const weaknessesByWorkspace = new Map<string, WorkspaceWeaknessInsight[]>();
  for (const row of (weaknessesResult.data ?? []) as WorkspaceWeaknessRow[]) {
    const weakness = mapWeakness(row);
    weaknessesByWorkspace.set(row.workspace_id, [...(weaknessesByWorkspace.get(row.workspace_id) ?? []), weakness]);
  }

  const recommendationsByWorkspace = new Map<string, WorkspaceRecommendation[]>();
  for (const row of (recommendationsResult.data ?? []) as WorkspaceRecommendationRow[]) {
    const recommendation = mapRecommendation(row);
    recommendationsByWorkspace.set(row.workspace_id, [
      ...(recommendationsByWorkspace.get(row.workspace_id) ?? []),
      recommendation,
    ]);
  }

  return ((workspaceResult.data ?? []) as WorkspaceRow[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    agentName: row.agent_name,
    purpose: row.purpose,
    description: row.description,
    owner: row.owner_name,
    team: row.team,
    health: row.health,
    primaryGoal: row.primary_goal,
    lastUpdated: row.last_updated,
    tags: row.tags ?? [],
    versions: versionsByWorkspace.get(row.id) ?? [],
    evaluations: evaluationsByWorkspace.get(row.id) ?? [],
    repeatedWeaknesses: weaknessesByWorkspace.get(row.id) ?? [],
    nextRecommendations: recommendationsByWorkspace.get(row.id) ?? [],
  }));
}

export function getLatestWorkspaceVersion(workspace: AgentWorkspace): AgentWorkspaceVersion | null {
  return [...workspace.versions].sort(
    (left, right) => new Date(right.releasedAt).getTime() - new Date(left.releasedAt).getTime()
  )[0] ?? null;
}

export function getWorkspaceTrendData(workspace: AgentWorkspace) {
  return [...workspace.versions]
    .sort((left, right) => new Date(left.releasedAt).getTime() - new Date(right.releasedAt).getTime())
    .map((version) => ({
      version: version.label,
      score: version.safetyScore,
      coverage: version.promptCoverage,
      evaluations: version.evaluationCount,
    }));
}

export function getWorkspaceSummary(workspace: AgentWorkspace) {
  const latestVersion = getLatestWorkspaceVersion(workspace);
  const totalEvaluations = workspace.evaluations.length;
  const highRiskRuns = workspace.evaluations.filter((evaluation) => evaluation.riskLevel === "High").length;
  const latestRuns = [...workspace.evaluations].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
  const latestScore = latestRuns[0]?.score ?? latestVersion?.safetyScore ?? 0;
  const baselineScore = workspace.versions[0]?.safetyScore ?? latestScore;

  return {
    latestVersion,
    totalEvaluations,
    highRiskRuns,
    latestScore,
    scoreDelta: latestScore - baselineScore,
    openRecommendations: workspace.nextRecommendations.length,
  };
}

export function findWorkspaceBySlug(workspaces: AgentWorkspace[], slug: string) {
  return workspaces.find((workspace) => workspace.slug === slug);
}

export function getWorkspaceOverviewStats(workspaces: AgentWorkspace[]) {
  const allEvaluations = workspaces.flatMap((workspace) => workspace.evaluations);
  const averageLatestScore =
    Math.round(
      workspaces.reduce((total, workspace) => total + getWorkspaceSummary(workspace).latestScore, 0) /
        Math.max(workspaces.length, 1)
    ) || 0;

  return {
    workspaceCount: workspaces.length,
    trackedVersions: workspaces.reduce((total, workspace) => total + workspace.versions.length, 0),
    averageLatestScore,
    highRiskRuns: allEvaluations.filter((evaluation) => evaluation.riskLevel === "High").length,
    improvingCount: workspaces.filter((workspace) => workspace.health === "Improving").length,
  };
}

export function getWorkspacesForOwner(workspaces: AgentWorkspace[], owner: string) {
  const normalizedOwner = owner.trim().toLowerCase();
  return workspaces.filter((workspace) => workspace.owner.trim().toLowerCase() === normalizedOwner);
}

export function getGlobalWeaknesses(workspaces: AgentWorkspace[]) {
  return workspaces
    .flatMap((workspace) =>
      workspace.repeatedWeaknesses.map((weakness) => ({
        ...weakness,
        workspaceName: workspace.name,
        workspaceSlug: workspace.slug,
      }))
    )
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return (
        HEALTH_ORDER[findWorkspaceBySlug(workspaces, right.workspaceSlug)?.health ?? "Stable"] -
        HEALTH_ORDER[findWorkspaceBySlug(workspaces, left.workspaceSlug)?.health ?? "Stable"]
      );
    });
}

export function getUpcomingRecommendations(workspaces: AgentWorkspace[]) {
  return workspaces
    .flatMap((workspace) =>
      workspace.nextRecommendations.map((recommendation) => ({
        ...recommendation,
        workspaceName: workspace.name,
        workspaceSlug: workspace.slug,
        health: workspace.health,
      }))
    )
    .sort((left, right) => IMPACT_ORDER[right.impact] - IMPACT_ORDER[left.impact]);
}

export function getAccessibleWorkspaceDashboard(workspaces: AgentWorkspace[]) {
  const evaluations = workspaces.flatMap((workspace) =>
    workspace.evaluations.map((evaluation) => ({
      ...evaluation,
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      agentName: workspace.agentName,
      versionLabel: workspace.versions.find((version) => version.id === evaluation.versionId)?.label ?? evaluation.versionId,
    }))
  );
  const repeatedWeaknesses = workspaces.flatMap((workspace) =>
    workspace.repeatedWeaknesses.map((weakness) => ({
      ...weakness,
      workspaceName: workspace.name,
    }))
  );
  const recommendations = workspaces.flatMap((workspace) =>
    workspace.nextRecommendations.map((recommendation) => ({
      ...recommendation,
      workspaceName: workspace.name,
    }))
  );
  const latestScores = workspaces.map((workspace) => getWorkspaceSummary(workspace).latestScore);
  const averageLatestScore =
    latestScores.length > 0
      ? Math.round(latestScores.reduce((total, score) => total + score, 0) / latestScores.length)
      : 0;

  return {
    workspaces,
    evaluations: evaluations.sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    ),
    repeatedWeaknesses: repeatedWeaknesses.sort((left, right) => right.count - left.count),
    recommendations,
    stats: {
      workspaceCount: workspaces.length,
      trackedVersions: workspaces.reduce((total, workspace) => total + workspace.versions.length, 0),
      totalEvaluations: evaluations.length,
      averageLatestScore,
      highRiskRuns: evaluations.filter((evaluation) => evaluation.riskLevel === "High").length,
      passCount: evaluations.filter((evaluation) => evaluation.status === "Pass").length,
      reviewCount: evaluations.filter((evaluation) => evaluation.status === "Review").length,
      failCount: evaluations.filter((evaluation) => evaluation.status === "Fail").length,
      improvingCount: workspaces.filter((workspace) => workspace.health === "Improving").length,
      persistentWeaknessCount: repeatedWeaknesses.filter((weakness) => weakness.trend === "Persistent").length,
    },
  };
}

export function getOwnerWorkspaceDashboard(owner: string, workspaces: AgentWorkspace[]) {
  const ownedWorkspaces = getWorkspacesForOwner(workspaces, owner);
  const evaluations = ownedWorkspaces.flatMap((workspace) =>
    workspace.evaluations.map((evaluation) => ({
      ...evaluation,
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      agentName: workspace.agentName,
      versionLabel: workspace.versions.find((version) => version.id === evaluation.versionId)?.label ?? evaluation.versionId,
    }))
  );
  const repeatedWeaknesses = ownedWorkspaces.flatMap((workspace) =>
    workspace.repeatedWeaknesses.map((weakness) => ({
      ...weakness,
      workspaceName: workspace.name,
    }))
  );
  const recommendations = ownedWorkspaces.flatMap((workspace) =>
    workspace.nextRecommendations.map((recommendation) => ({
      ...recommendation,
      workspaceName: workspace.name,
    }))
  );
  const latestScores = ownedWorkspaces.map((workspace) => getWorkspaceSummary(workspace).latestScore);
  const averageLatestScore =
    latestScores.length > 0
      ? Math.round(latestScores.reduce((total, score) => total + score, 0) / latestScores.length)
      : 0;

  return {
    workspaces: ownedWorkspaces,
    evaluations: evaluations.sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    ),
    repeatedWeaknesses: repeatedWeaknesses.sort((left, right) => right.count - left.count),
    recommendations,
    stats: {
      workspaceCount: ownedWorkspaces.length,
      trackedVersions: ownedWorkspaces.reduce((total, workspace) => total + workspace.versions.length, 0),
      totalEvaluations: evaluations.length,
      averageLatestScore,
      highRiskRuns: evaluations.filter((evaluation) => evaluation.riskLevel === "High").length,
      passCount: evaluations.filter((evaluation) => evaluation.status === "Pass").length,
      reviewCount: evaluations.filter((evaluation) => evaluation.status === "Review").length,
      failCount: evaluations.filter((evaluation) => evaluation.status === "Fail").length,
      improvingCount: ownedWorkspaces.filter((workspace) => workspace.health === "Improving").length,
      persistentWeaknessCount: repeatedWeaknesses.filter((weakness) => weakness.trend === "Persistent").length,
    },
  };
}
