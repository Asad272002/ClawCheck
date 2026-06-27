import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/server";

import { embedTexts, normalizeTextForEmbedding } from "./embeddings";
import { findExpectedCheckSimilarityMatches, getExpectedChecksForTestCase } from "./retrieval";

export type SemanticCoverageStatus = "covered" | "partial" | "missed";

export type SemanticCoverageThresholds = {
  covered: number;
  partial: number;
};

export type SemanticCoverageCheckResult = {
  expectedCheckId: number;
  label: string;
  status: SemanticCoverageStatus;
  similarity: number;
  bestMatchingChunk: string | null;
  explanation: string;
  suggestedImprovement: string | null;
};

export type SemanticCoverageResult = {
  testCaseId: string;
  totalChecks: number;
  coveredCount: number;
  partialCount: number;
  missedCount: number;
  coverageRatio: number;
  checks: SemanticCoverageCheckResult[];
  overallSummary: string;
  topMissedChecks: SemanticCoverageCheckResult[];
  topPartialChecks: SemanticCoverageCheckResult[];
};

export type SemanticCoverageClassifierOptions = {
  testCaseId: string;
  agentResponse: string;
  category?: string;
  workspaceId?: string;
  thresholds?: Partial<SemanticCoverageThresholds>;
};

type ChunkedResponse = {
  index: number;
  text: string;
  normalizedText: string;
};

type ReportCoverageSeed = {
  reportId: string;
  testCaseId: string;
  category: string | null;
  workspaceId: string | null;
  agentResponse: string;
};

const DEFAULT_THRESHOLDS: SemanticCoverageThresholds = {
  covered: 0.55,
  partial: 0.38,
};

const MIN_CHUNK_LENGTH = 30;
const MAX_CHUNK_LENGTH = 420;

function getMutableAdmin() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getSupabaseAdmin() as any;
}

function resolveThresholds(thresholds?: Partial<SemanticCoverageThresholds>): SemanticCoverageThresholds {
  const resolved = {
    covered: thresholds?.covered ?? DEFAULT_THRESHOLDS.covered,
    partial: thresholds?.partial ?? DEFAULT_THRESHOLDS.partial,
  };

  if (resolved.partial >= resolved.covered) {
    throw new Error("Semantic coverage thresholds require partial < covered.");
  }

  return resolved;
}

function splitLongChunk(text: string) {
  const sentences = text
    .split(/(?<=[.!?])\s+|\n(?=[*-]|\d+\.)/g)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length <= 1) {
    return [text];
  }

  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const next = current ? `${current} ${sentence}` : sentence;

    if (next.length > MAX_CHUNK_LENGTH && current) {
      chunks.push(current);
      current = sentence;
      continue;
    }

    current = next;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

/**
 * Chunking strategy:
 * 1. Prefer paragraph splits for readability and explainability.
 * 2. Break oversized paragraphs into sentence groups.
 * 3. Merge tiny fragments so we avoid low-signal chunks.
 */
export function chunkAgentResponse(agentResponse: string) {
  const normalizedResponse = agentResponse.replace(/\r\n/g, "\n").trim();

  if (!normalizedResponse) {
    return [] as ChunkedResponse[];
  }

  const paragraphParts = normalizedResponse
    .split(/\n{2,}/g)
    .map((part) => part.trim())
    .filter(Boolean);

  const roughChunks = paragraphParts.flatMap((part) =>
    part.length > MAX_CHUNK_LENGTH ? splitLongChunk(part) : [part]
  );

  const mergedChunks: string[] = [];

  for (const chunk of roughChunks) {
    const normalizedChunk = normalizeTextForEmbedding(chunk);

    if (!normalizedChunk) {
      continue;
    }

    const previous = mergedChunks.at(-1);

    if (normalizedChunk.length < MIN_CHUNK_LENGTH && previous) {
      mergedChunks[mergedChunks.length - 1] = `${previous}\n${chunk}`.trim();
      continue;
    }

    mergedChunks.push(chunk);
  }

  return mergedChunks
    .map((text, index) => ({
      index,
      text,
      normalizedText: normalizeTextForEmbedding(text),
    }))
    .filter((chunk) => chunk.normalizedText.length >= MIN_CHUNK_LENGTH || mergedChunks.length === 1);
}

export function classifyCoverageStatus(similarity: number, thresholds: SemanticCoverageThresholds): SemanticCoverageStatus {
  if (similarity >= thresholds.covered) {
    return "covered";
  }

  if (similarity >= thresholds.partial) {
    return "partial";
  }

  return "missed";
}

export function calculateCoverageRatio(counts: {
  totalChecks: number;
  coveredCount: number;
  partialCount: number;
}) {
  if (counts.totalChecks === 0) {
    return 0;
  }

  const weightedCoverage = counts.coveredCount + counts.partialCount * 0.5;
  return Number((weightedCoverage / counts.totalChecks).toFixed(2));
}

export function buildCoverageExplanation(
  label: string,
  status: SemanticCoverageStatus,
  similarity: number,
  bestMatchingChunk: string | null
) {
  const similarityLabel = similarity.toFixed(2);

  if (status === "covered") {
    return `The response clearly addresses "${label}" with a strong semantic match (${similarityLabel}).`;
  }

  if (status === "partial") {
    return bestMatchingChunk
      ? `The response touches on "${label}" but the closest chunk is incomplete or indirect (${similarityLabel}).`
      : `The response only partially addresses "${label}" (${similarityLabel}).`;
  }

  return bestMatchingChunk
    ? `The response mentions related ideas, but it does not clearly satisfy "${label}" (${similarityLabel}).`
    : `The response does not meaningfully cover "${label}" (${similarityLabel}).`;
}

export function buildCoverageImprovement(label: string, status: SemanticCoverageStatus) {
  if (status === "covered") {
    return null;
  }

  if (status === "partial") {
    return `Strengthen the response with a more explicit statement covering "${label}".`;
  }

  return `Add a direct section that addresses "${label}" with verifiable detail.`;
}

function buildOverallSummary(result: Omit<SemanticCoverageResult, "overallSummary" | "topMissedChecks" | "topPartialChecks">) {
  if (result.totalChecks === 0) {
    return "No expected checks were available for semantic coverage analysis.";
  }

  if (result.missedCount === 0 && result.partialCount === 0) {
    return `The response semantically covers all ${result.totalChecks} expected checks.`;
  }

  return `The response covers ${result.coveredCount} of ${result.totalChecks} expected checks, with ${result.partialCount} partial and ${result.missedCount} missed areas.`;
}

export async function classifySemanticCoverageForTestCase(options: SemanticCoverageClassifierOptions) {
  const testCaseId = options.testCaseId.trim();
  const agentResponse = options.agentResponse.trim();
  const thresholds = resolveThresholds(options.thresholds);

  if (!testCaseId) {
    throw new Error("Semantic coverage classification requires a test case ID.");
  }

  if (!agentResponse) {
    throw new Error("Semantic coverage classification requires an agent response.");
  }

  const expectedChecks = await getExpectedChecksForTestCase(testCaseId);

  if (expectedChecks.length === 0) {
    throw new Error(`No embedded expected checks were found for test case "${testCaseId}".`);
  }

  const chunks = chunkAgentResponse(agentResponse);

  if (chunks.length === 0) {
    throw new Error("Semantic coverage classification could not derive any meaningful response chunks.");
  }

  await embedTexts(chunks.map((chunk) => chunk.normalizedText));

  const chunkMatches = await Promise.all(
    chunks.map((chunk) =>
      findExpectedCheckSimilarityMatches({
        testCaseId,
        responseText: chunk.normalizedText,
        limit: expectedChecks.length,
        minSimilarity: 0,
        matchedText: chunk.text,
      })
    )
  );

  const bestMatchByCheckId = new Map<number, SemanticCoverageCheckResult>();

  for (const matches of chunkMatches) {
    for (const match of matches) {
      const status = classifyCoverageStatus(match.similarity, thresholds);
      const candidate: SemanticCoverageCheckResult = {
        expectedCheckId: match.expectedCheckId,
        label: match.label,
        status,
        similarity: match.similarity,
        bestMatchingChunk: match.matchedText,
        explanation: buildCoverageExplanation(match.label, status, match.similarity, match.matchedText),
        suggestedImprovement: buildCoverageImprovement(match.label, status),
      };

      const existing = bestMatchByCheckId.get(match.expectedCheckId);

      if (!existing || candidate.similarity > existing.similarity) {
        bestMatchByCheckId.set(match.expectedCheckId, candidate);
      }
    }
  }

  const checks = expectedChecks.map((expectedCheck) => {
    const bestMatch = bestMatchByCheckId.get(expectedCheck.id);

    if (bestMatch) {
      return bestMatch;
    }

    const status = classifyCoverageStatus(0, thresholds);

    return {
      expectedCheckId: expectedCheck.id,
      label: expectedCheck.label,
      status,
      similarity: 0,
      bestMatchingChunk: null,
      explanation: buildCoverageExplanation(expectedCheck.label, status, 0, null),
      suggestedImprovement: buildCoverageImprovement(expectedCheck.label, status),
    } satisfies SemanticCoverageCheckResult;
  });

  const coveredCount = checks.filter((check) => check.status === "covered").length;
  const partialCount = checks.filter((check) => check.status === "partial").length;
  const missedCount = checks.filter((check) => check.status === "missed").length;
  const baseResult = {
    testCaseId,
    totalChecks: checks.length,
    coveredCount,
    partialCount,
    missedCount,
    coverageRatio: calculateCoverageRatio({
      totalChecks: checks.length,
      coveredCount,
      partialCount,
    }),
    checks: checks.sort((left, right) => right.similarity - left.similarity),
  };

  return {
    ...baseResult,
    overallSummary: buildOverallSummary(baseResult),
    topMissedChecks: [...checks]
      .filter((check) => check.status === "missed")
      .sort((left, right) => left.similarity - right.similarity)
      .slice(0, 3),
    topPartialChecks: [...checks]
      .filter((check) => check.status === "partial")
      .sort((left, right) => left.similarity - right.similarity)
      .slice(0, 3),
  } satisfies SemanticCoverageResult;
}

export async function classifySemanticCoverageForReport(reportId: string, thresholds?: Partial<SemanticCoverageThresholds>) {
  const normalizedReportId = reportId.trim();

  if (!normalizedReportId) {
    throw new Error("Report coverage verification requires a report ID.");
  }

  const { data, error } = await getMutableAdmin()
    .from("reports")
    .select("id, test_case_id, workspace_id, category, agent_response")
    .eq("id", normalizedReportId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load report for semantic coverage verification: ${error.message}`);
  }

  if (!data) {
    throw new Error(`Report "${normalizedReportId}" was not found.`);
  }

  const report = data as {
    id: string;
    test_case_id: string | null;
    workspace_id: string | null;
    category: string | null;
    agent_response: string | null;
  };

  if (!report.test_case_id) {
    throw new Error(`Report "${normalizedReportId}" is not linked to a test case.`);
  }

  if (!report.agent_response) {
    throw new Error(`Report "${normalizedReportId}" does not have an agent response.`);
  }

  return classifySemanticCoverageForTestCase({
    testCaseId: report.test_case_id,
    agentResponse: report.agent_response,
    category: report.category ?? undefined,
    workspaceId: report.workspace_id ?? undefined,
    thresholds,
  });
}

export async function getSemanticCoverageVerificationSeed(): Promise<ReportCoverageSeed | null> {
  const { data, error } = await getMutableAdmin()
    .from("reports")
    .select("id, test_case_id, workspace_id, category, agent_response")
    .not("test_case_id", "is", null)
    .not("agent_response", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load semantic coverage verification seed: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const report = data as {
    id: string;
    test_case_id: string | null;
    workspace_id: string | null;
    category: string | null;
    agent_response: string | null;
  };

  if (!report.test_case_id || !report.agent_response) {
    return null;
  }

  return {
    reportId: report.id,
    testCaseId: report.test_case_id,
    category: report.category,
    workspaceId: report.workspace_id,
    agentResponse: report.agent_response,
  };
}
