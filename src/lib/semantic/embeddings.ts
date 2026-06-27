import "server-only";

const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";
const DEFAULT_EMBEDDING_BASE_URL = "https://api.openai.com/v1";
export const EMBEDDING_DIMENSIONS = 1536;

export class EmbeddingConfigurationError extends Error {}
export class EmbeddingProviderError extends Error {}

export type EmbeddingConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  dimensions: number;
};

export type EmbeddingSuccessRow = {
  index: number;
  text: string;
  normalizedText: string;
  embedding: number[];
};

export type EmbeddingFailedRow = {
  index: number;
  text: string;
  normalizedText: string;
  reason: string;
};

export type EmbeddingBatchResult = {
  model: string;
  succeeded: EmbeddingSuccessRow[];
  failed: EmbeddingFailedRow[];
};

type OpenAIEmbeddingResponse = {
  data?: Array<{
    embedding?: number[];
    index?: number;
  }>;
  model?: string;
  error?: {
    message?: string;
  };
};

export function normalizeTextForEmbedding(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

export function getEmbeddingConfig(): EmbeddingConfig {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_EMBEDDING_MODEL?.trim() || DEFAULT_EMBEDDING_MODEL;
  const baseUrl = process.env.OPENAI_BASE_URL?.trim() || DEFAULT_EMBEDDING_BASE_URL;

  if (!apiKey) {
    throw new EmbeddingConfigurationError(
      "Missing embedding provider configuration: OPENAI_API_KEY must be set for semantic reindexing."
    );
  }

  return {
    apiKey,
    baseUrl,
    model,
    dimensions: EMBEDDING_DIMENSIONS,
  };
}

function toFailure(index: number, text: string, normalizedText: string, reason: string): EmbeddingFailedRow {
  return {
    index,
    text,
    normalizedText,
    reason,
  };
}

export async function embedTexts(texts: string[]): Promise<EmbeddingBatchResult> {
  const config = getEmbeddingConfig();
  const prepared = texts.map((text, index) => ({
    index,
    text,
    normalizedText: normalizeTextForEmbedding(text),
  }));

  const invalidRows = prepared
    .filter((item) => item.normalizedText.length === 0)
    .map((item) => toFailure(item.index, item.text, item.normalizedText, "Text is empty after normalization."));
  const validRows = prepared.filter((item) => item.normalizedText.length > 0);

  if (validRows.length === 0) {
    return {
      model: config.model,
      succeeded: [],
      failed: invalidRows,
    };
  }

  const response = await fetch(`${config.baseUrl}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      input: validRows.map((item) => item.normalizedText),
    }),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as OpenAIEmbeddingResponse | null;

  if (!response.ok) {
    throw new EmbeddingProviderError(
      payload?.error?.message || `Embedding provider request failed with status ${response.status}.`
    );
  }

  const data = payload?.data ?? [];

  if (data.length !== validRows.length) {
    throw new EmbeddingProviderError(
      `Embedding provider returned ${data.length} vectors for ${validRows.length} requested texts.`
    );
  }

  const succeeded: EmbeddingSuccessRow[] = [];
  const failed = [...invalidRows];

  for (let position = 0; position < validRows.length; position += 1) {
    const row = validRows[position]!;
    const embedding = data[position]?.embedding;

    if (!Array.isArray(embedding)) {
      failed.push(toFailure(row.index, row.text, row.normalizedText, "Provider returned a missing or invalid embedding."));
      continue;
    }

    if (embedding.length !== config.dimensions) {
      throw new EmbeddingProviderError(
        `Embedding model ${config.model} returned ${embedding.length} dimensions, expected ${config.dimensions}.`
      );
    }

    succeeded.push({
      index: row.index,
      text: row.text,
      normalizedText: row.normalizedText,
      embedding,
    });
  }

  return {
    model: payload?.model || config.model,
    succeeded,
    failed,
  };
}
