import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/server";

import { embedTexts, normalizeTextForEmbedding } from "./embeddings";

export type ExpectedCheckEmbeddingRow = {
  id: number;
  testCaseId: string;
  label: string;
  description: string | null;
  weight: number | null;
  embeddingModel: string | null;
  embeddingUpdatedAt: string | null;
};

export type ExpectedCheckSimilarityMatch = {
  expectedCheckId: number;
  testCaseId: string;
  label: string;
  description: string | null;
  weight: number | null;
  similarity: number;
  matchedText: string | null;
  statusReady: {
    hasEmbedding: true;
    aboveThreshold: boolean;
  };
};

export type SimilarReportMatch = {
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

export type SimilarTestCaseMatch = {
  testCaseId: string;
  category: string;
  title: string;
  difficulty: string;
  prompt: string;
  similarity: number;
};

export type SemanticReportSearchFilters = {
  workspaceId?: string;
  category?: string;
  status?: string;
  riskLevel?: string;
  minScore?: number;
  maxScore?: number;
};

export type SemanticTestCaseSearchFilters = {
  category?: string;
  difficulty?: string;
};

type RetrievalInput = {
  text?: string;
  embedding?: number[];
};

type ExpectedCheckRow = {
  id: number;
  test_case_id: string;
  label: string;
  description: string | null;
  weight: number | null;
  embedding_model: string | null;
  embedding_updated_at: string | null;
};

type ExpectedCheckMatchRow = {
  id: number;
  test_case_id: string;
  label: string;
  description: string | null;
  weight: number | null;
  similarity: number;
};

type SimilarReportRow = {
  id: string;
  workspace_id: string | null;
  test_case_id: string | null;
  created_at: string;
  agent_name: string;
  category: string;
  final_score: number;
  status: string;
  risk_level: string;
  summary: string;
  similarity: number;
};

type SimilarTestCaseRow = {
  id: string;
  category: string;
  title: string;
  difficulty: string;
  prompt: string;
  similarity: number;
};

function getMutableAdmin() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getSupabaseAdmin() as any;
}

function vectorLiteral(embedding: number[]) {
  return `[${embedding.join(",")}]`;
}

function ensurePositiveLimit(limit: number | undefined, fallback: number) {
  if (!limit || Number.isNaN(limit)) {
    return fallback;
  }

  return Math.max(1, Math.min(50, Math.trunc(limit)));
}

function validateEmbedding(embedding: number[]) {
  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new Error("Semantic retrieval requires a non-empty embedding.");
  }

  return embedding;
}

async function resolveQueryEmbedding(input: RetrievalInput) {
  if (input.embedding) {
    return validateEmbedding(input.embedding);
  }

  const normalizedText = normalizeTextForEmbedding(input.text ?? "");

  if (!normalizedText) {
    throw new Error("Semantic retrieval requires either a non-empty text query or a precomputed embedding.");
  }

  const result = await embedTexts([normalizedText]);
  const embedding = result.succeeded[0]?.embedding;

  if (!embedding) {
    const failureReason = result.failed[0]?.reason ?? "Embedding provider returned no vector.";
    throw new Error(`Unable to generate retrieval embedding: ${failureReason}`);
  }

  return embedding;
}

function mapExpectedCheckRow(row: ExpectedCheckRow): ExpectedCheckEmbeddingRow {
  return {
    id: row.id,
    testCaseId: row.test_case_id,
    label: row.label,
    description: row.description,
    weight: row.weight === null ? null : Number(row.weight),
    embeddingModel: row.embedding_model,
    embeddingUpdatedAt: row.embedding_updated_at,
  };
}

function mapExpectedCheckMatch(
  row: ExpectedCheckMatchRow,
  matchedText: string | null,
  minSimilarity: number
): ExpectedCheckSimilarityMatch {
  return {
    expectedCheckId: row.id,
    testCaseId: row.test_case_id,
    label: row.label,
    description: row.description,
    weight: row.weight === null ? null : Number(row.weight),
    similarity: row.similarity,
    matchedText,
    statusReady: {
      hasEmbedding: true,
      aboveThreshold: row.similarity >= minSimilarity,
    },
  };
}

function mapSimilarReport(row: SimilarReportRow): SimilarReportMatch {
  return {
    reportId: row.id,
    workspaceId: row.workspace_id,
    testCaseId: row.test_case_id,
    createdAt: row.created_at,
    agentName: row.agent_name,
    category: row.category,
    finalScore: row.final_score,
    status: row.status,
    riskLevel: row.risk_level,
    summary: row.summary,
    similarity: row.similarity,
  };
}

function mapSimilarTestCase(row: SimilarTestCaseRow): SimilarTestCaseMatch {
  return {
    testCaseId: row.id,
    category: row.category,
    title: row.title,
    difficulty: row.difficulty,
    prompt: row.prompt,
    similarity: row.similarity,
  };
}

export async function getExpectedChecksForTestCase(testCaseId: string) {
  const normalizedTestCaseId = testCaseId.trim();

  if (!normalizedTestCaseId) {
    throw new Error("Expected-check retrieval requires a test case ID.");
  }

  const { data, error } = await getMutableAdmin()
    .from("test_case_expected_checks")
    .select("id, test_case_id, label, description, weight, embedding_model, embedding_updated_at")
    .eq("test_case_id", normalizedTestCaseId)
    .not("embedding", "is", null)
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`Unable to load expected checks: ${error.message}`);
  }

  return ((data ?? []) as ExpectedCheckRow[]).map(mapExpectedCheckRow);
}

export async function findExpectedCheckSimilarityMatches(options: {
  testCaseId: string;
  responseText?: string;
  responseEmbedding?: number[];
  limit?: number;
  minSimilarity?: number;
  matchedText?: string;
}) {
  const normalizedTestCaseId = options.testCaseId.trim();

  if (!normalizedTestCaseId) {
    throw new Error("Expected-check similarity requires a test case ID.");
  }

  const embedding = await resolveQueryEmbedding({
    text: options.responseText,
    embedding: options.responseEmbedding,
  });
  const minSimilarity = options.minSimilarity ?? 0;
  const limit = ensurePositiveLimit(options.limit, 10);
  const matchedText =
    options.matchedText ?? (options.responseText ? normalizeTextForEmbedding(options.responseText) : null);

  const { data, error } = await getMutableAdmin().rpc("match_expected_checks", {
    query_embedding: vectorLiteral(embedding),
    match_test_case_id: normalizedTestCaseId,
    match_count: limit,
    min_similarity: minSimilarity,
  });

  if (error) {
    throw new Error(`Unable to search expected-check similarities: ${error.message}`);
  }

  return ((data ?? []) as ExpectedCheckMatchRow[]).map((row) => mapExpectedCheckMatch(row, matchedText, minSimilarity));
}

export async function findSimilarReports(options: {
  responseText?: string;
  responseEmbedding?: number[];
  limit?: number;
  filters?: SemanticReportSearchFilters;
}) {
  const embedding = await resolveQueryEmbedding({
    text: options.responseText,
    embedding: options.responseEmbedding,
  });
  const limit = ensurePositiveLimit(options.limit, 10);
  const filters = options.filters ?? {};

  const { data, error } = await getMutableAdmin().rpc("match_reports", {
    query_embedding: vectorLiteral(embedding),
    match_count: limit,
    match_workspace_id: filters.workspaceId ?? null,
    match_category: filters.category ?? null,
    match_status: filters.status ?? null,
    match_risk_level: filters.riskLevel ?? null,
    min_score: filters.minScore ?? null,
    max_score: filters.maxScore ?? null,
  });

  if (error) {
    throw new Error(`Unable to search similar reports: ${error.message}`);
  }

  return ((data ?? []) as SimilarReportRow[]).map(mapSimilarReport);
}

export async function findWorkspaceSemanticHistory(options: {
  workspaceId: string;
  responseText?: string;
  responseEmbedding?: number[];
  limit?: number;
  filters?: Omit<SemanticReportSearchFilters, "workspaceId">;
}) {
  const normalizedWorkspaceId = options.workspaceId.trim();

  if (!normalizedWorkspaceId) {
    throw new Error("Workspace semantic history requires a workspace ID.");
  }

  return findSimilarReports({
    responseText: options.responseText,
    responseEmbedding: options.responseEmbedding,
    limit: options.limit,
    filters: {
      ...(options.filters ?? {}),
      workspaceId: normalizedWorkspaceId,
    },
  });
}

export async function findSimilarTestCases(options: {
  promptText?: string;
  promptEmbedding?: number[];
  limit?: number;
  filters?: SemanticTestCaseSearchFilters;
}) {
  const embedding = await resolveQueryEmbedding({
    text: options.promptText,
    embedding: options.promptEmbedding,
  });
  const limit = ensurePositiveLimit(options.limit, 10);
  const filters = options.filters ?? {};

  const { data, error } = await getMutableAdmin().rpc("match_test_cases", {
    query_embedding: vectorLiteral(embedding),
    match_count: limit,
    match_category: filters.category ?? null,
    match_difficulty: filters.difficulty ?? null,
  });

  if (error) {
    throw new Error(`Unable to search similar test cases: ${error.message}`);
  }

  return ((data ?? []) as SimilarTestCaseRow[]).map(mapSimilarTestCase);
}
