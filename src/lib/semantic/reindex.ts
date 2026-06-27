import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/server";

import {
  EmbeddingConfigurationError,
  EmbeddingProviderError,
  embedTexts,
  getEmbeddingConfig,
} from "./embeddings";

type ReindexTargetKey =
  | "expectedChecks"
  | "testCasePrompts"
  | "reportAgentResponses"
  | "reportSummaries";

type ReindexTargetSummary = {
  key: ReindexTargetKey;
  label: string;
  rowsNeedingEmbeddings: number;
  rowsProcessed: number;
  rowsSucceeded: number;
  rowsFailed: number;
  failedRows: Array<{
    id: string;
    reason: string;
  }>;
};

export type SemanticReindexOptions = {
  force?: boolean;
  batchSize?: number;
};

export type SemanticReindexReport = {
  provider: {
    provider: string;
    model: string;
    dimensions: number;
  } | null;
  targets: ReindexTargetSummary[];
};

type ExpectedCheckRow = {
  id: number;
  label: string;
};

type TestCaseRow = {
  id: string;
  prompt: string;
};

type ReportResponseRow = {
  id: string;
  agent_response: string;
};

type ReportSummaryRow = {
  id: string;
  summary: string;
};

type TargetDefinition<Row> = {
  key: ReindexTargetKey;
  label: string;
  loadRows: (admin: ReturnType<typeof getSupabaseAdmin>, force: boolean) => Promise<Row[]>;
  getId: (row: Row) => string;
  getText: (row: Row) => string;
  persist: (admin: ReturnType<typeof getSupabaseAdmin>, row: Row, payload: PersistPayload) => Promise<void>;
};

type PersistPayload = {
  embedding: number[];
  model: string;
  updatedAt: string;
};

function defineTarget<Row>(target: TargetDefinition<Row>) {
  return target;
}

function getMutableAdmin(admin: ReturnType<typeof getSupabaseAdmin>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return admin as any;
}

function vectorLiteral(embedding: number[]) {
  return `[${embedding.join(",")}]`;
}

function ensureBatchSize(value: number | undefined) {
  if (!value || Number.isNaN(value)) {
    return 20;
  }

  return Math.max(1, Math.min(100, Math.trunc(value)));
}

async function loadExpectedChecks(admin: ReturnType<typeof getSupabaseAdmin>, force: boolean) {
  let query = getMutableAdmin(admin)
    .from("test_case_expected_checks")
    .select("id, label")
    .order("id", { ascending: true });

  if (!force) {
    query = query.is("embedding", null);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Unable to load expected checks for semantic reindex: ${error.message}`);
  }

  return (data ?? []) as ExpectedCheckRow[];
}

async function loadTestCasePrompts(admin: ReturnType<typeof getSupabaseAdmin>, force: boolean) {
  let query = getMutableAdmin(admin)
    .from("test_cases")
    .select("id, prompt")
    .order("id", { ascending: true });

  if (!force) {
    query = query.is("prompt_embedding", null);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Unable to load test case prompts for semantic reindex: ${error.message}`);
  }

  return (data ?? []) as TestCaseRow[];
}

async function loadReportAgentResponses(admin: ReturnType<typeof getSupabaseAdmin>, force: boolean) {
  let query = getMutableAdmin(admin)
    .from("reports")
    .select("id, agent_response")
    .order("created_at", { ascending: true });

  if (!force) {
    query = query.is("agent_response_embedding", null);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Unable to load report responses for semantic reindex: ${error.message}`);
  }

  return (data ?? []) as ReportResponseRow[];
}

async function loadReportSummaries(admin: ReturnType<typeof getSupabaseAdmin>, force: boolean) {
  let query = getMutableAdmin(admin)
    .from("reports")
    .select("id, summary")
    .order("created_at", { ascending: true });

  if (!force) {
    query = query.is("summary_embedding", null);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Unable to load report summaries for semantic reindex: ${error.message}`);
  }

  return (data ?? []) as ReportSummaryRow[];
}

async function persistExpectedCheck(admin: ReturnType<typeof getSupabaseAdmin>, row: ExpectedCheckRow, payload: PersistPayload) {
  const { error } = await getMutableAdmin(admin)
    .from("test_case_expected_checks")
    .update({
      embedding: vectorLiteral(payload.embedding),
      embedding_model: payload.model,
      embedding_updated_at: payload.updatedAt,
      updated_at: payload.updatedAt,
    })
    .eq("id", row.id);

  if (error) {
    throw new Error(error.message);
  }
}

async function persistTestCasePrompt(admin: ReturnType<typeof getSupabaseAdmin>, row: TestCaseRow, payload: PersistPayload) {
  const { error } = await getMutableAdmin(admin)
    .from("test_cases")
    .update({
      prompt_embedding: vectorLiteral(payload.embedding),
      prompt_embedding_model: payload.model,
      prompt_embedding_updated_at: payload.updatedAt,
    })
    .eq("id", row.id);

  if (error) {
    throw new Error(error.message);
  }
}

async function persistReportAgentResponse(admin: ReturnType<typeof getSupabaseAdmin>, row: ReportResponseRow, payload: PersistPayload) {
  const { error } = await getMutableAdmin(admin)
    .from("reports")
    .update({
      agent_response_embedding: vectorLiteral(payload.embedding),
      agent_response_embedding_model: payload.model,
      agent_response_embedding_updated_at: payload.updatedAt,
    })
    .eq("id", row.id);

  if (error) {
    throw new Error(error.message);
  }
}

async function persistReportSummary(admin: ReturnType<typeof getSupabaseAdmin>, row: ReportSummaryRow, payload: PersistPayload) {
  const { error } = await getMutableAdmin(admin)
    .from("reports")
    .update({
      summary_embedding: vectorLiteral(payload.embedding),
      summary_embedding_model: payload.model,
      summary_embedding_updated_at: payload.updatedAt,
    })
    .eq("id", row.id);

  if (error) {
    throw new Error(error.message);
  }
}

const TARGETS = [
  defineTarget({
    key: "expectedChecks",
    label: "Expected checks",
    loadRows: loadExpectedChecks,
    getId: (row: ExpectedCheckRow) => String(row.id),
    getText: (row: ExpectedCheckRow) => row.label,
    persist: persistExpectedCheck,
  }),
  defineTarget({
    key: "testCasePrompts",
    label: "Test case prompts",
    loadRows: loadTestCasePrompts,
    getId: (row: TestCaseRow) => row.id,
    getText: (row: TestCaseRow) => row.prompt,
    persist: persistTestCasePrompt,
  }),
  defineTarget({
    key: "reportAgentResponses",
    label: "Report agent responses",
    loadRows: loadReportAgentResponses,
    getId: (row: ReportResponseRow) => row.id,
    getText: (row: ReportResponseRow) => row.agent_response,
    persist: persistReportAgentResponse,
  }),
  defineTarget({
    key: "reportSummaries",
    label: "Report summaries",
    loadRows: loadReportSummaries,
    getId: (row: ReportSummaryRow) => row.id,
    getText: (row: ReportSummaryRow) => row.summary,
    persist: persistReportSummary,
  }),
] as const;

export async function previewSemanticReindex(options: SemanticReindexOptions = {}): Promise<SemanticReindexReport> {
  const admin = getSupabaseAdmin();
  const force = Boolean(options.force);
  const config = getEmbeddingConfig();

  const targets = await Promise.all(
    TARGETS.map(async (target) => {
      const rows = await target.loadRows(admin, force);

      return {
        key: target.key,
        label: target.label,
        rowsNeedingEmbeddings: rows.length,
        rowsProcessed: 0,
        rowsSucceeded: 0,
        rowsFailed: 0,
        failedRows: [],
      } satisfies ReindexTargetSummary;
    })
  );

  return {
    provider: {
      provider: config.provider,
      model: config.model,
      dimensions: config.dimensions,
    },
    targets,
  };
}

async function processTarget<Row>(
  admin: ReturnType<typeof getSupabaseAdmin>,
  target: TargetDefinition<Row>,
  rows: Row[],
  batchSize: number
): Promise<ReindexTargetSummary> {
  const summary: ReindexTargetSummary = {
    key: target.key,
    label: target.label,
    rowsNeedingEmbeddings: rows.length,
    rowsProcessed: 0,
    rowsSucceeded: 0,
    rowsFailed: 0,
    failedRows: [],
  };

  for (let start = 0; start < rows.length; start += batchSize) {
    const batch = rows.slice(start, start + batchSize);
    const batchResult = await embedTexts(batch.map((row) => target.getText(row)));

    summary.rowsProcessed += batch.length;

    const rowsByBatchIndex = new Map(batch.map((row, index) => [index, row]));
    const updatedAt = new Date().toISOString();

    for (const failed of batchResult.failed) {
      const row = rowsByBatchIndex.get(failed.index);

      summary.rowsFailed += 1;
      summary.failedRows.push({
        id: row ? target.getId(row) : `batch-index-${failed.index}`,
        reason: failed.reason,
      });
    }

    for (const succeeded of batchResult.succeeded) {
      const row = rowsByBatchIndex.get(succeeded.index);

      if (!row) {
        summary.rowsFailed += 1;
        summary.failedRows.push({
          id: `batch-index-${succeeded.index}`,
          reason: "Row lookup failed after embedding generation.",
        });
        continue;
      }

      try {
        await target.persist(admin, row, {
          embedding: succeeded.embedding,
          model: batchResult.model,
          updatedAt,
        });
        summary.rowsSucceeded += 1;
      } catch (error) {
        summary.rowsFailed += 1;
        summary.failedRows.push({
          id: target.getId(row),
          reason: error instanceof Error ? error.message : "Unknown persistence error.",
        });
      }
    }
  }

  return summary;
}

export async function runSemanticReindex(options: SemanticReindexOptions = {}): Promise<SemanticReindexReport> {
  const admin = getSupabaseAdmin();
  const force = Boolean(options.force);
  const batchSize = ensureBatchSize(options.batchSize);
  const preview = await previewSemanticReindex(options);
  const config = getEmbeddingConfig();

  try {
    const rowsByTarget = await Promise.all(TARGETS.map((target) => target.loadRows(admin, force)));
    const targets = [] as ReindexTargetSummary[];

    for (let index = 0; index < TARGETS.length; index += 1) {
      const target = TARGETS[index] as TargetDefinition<unknown>;
      const rows = rowsByTarget[index] as unknown[];
      const targetSummary = await processTarget(admin, target, rows, batchSize);
      targets.push(targetSummary);
    }

    return {
      provider: {
        provider: config.provider,
        model: config.model,
        dimensions: config.dimensions,
      },
      targets,
    };
  } catch (error) {
    if (error instanceof EmbeddingConfigurationError || error instanceof EmbeddingProviderError) {
      throw Object.assign(error, { preview });
    }

    throw error;
  }
}
