import "server-only";

import type { DataType, DeviceType, Tensor } from "@huggingface/transformers";

const DEFAULT_EMBEDDING_PROVIDER = "local-transformers";
const DEFAULT_EMBEDDING_MODEL = "onnx-community/all-MiniLM-L6-v2-ONNX";
const DEFAULT_EMBEDDING_DIMENSIONS = 384;
const DEFAULT_EMBEDDING_DTYPE = "fp32";
export const EMBEDDING_DIMENSIONS = DEFAULT_EMBEDDING_DIMENSIONS;

export class EmbeddingConfigurationError extends Error {}
export class EmbeddingProviderError extends Error {}

export type EmbeddingProvider = "local-transformers";

export type EmbeddingConfig = {
  provider: EmbeddingProvider;
  model: string;
  dimensions: number;
  cacheDir?: string;
  device?: DeviceType;
  dtype: DataType;
  localFilesOnly: boolean;
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
  provider: EmbeddingProvider;
  model: string;
  dimensions: number;
  succeeded: EmbeddingSuccessRow[];
  failed: EmbeddingFailedRow[];
};

type FeatureExtractor = (
  texts: string | string[],
  options?: {
    pooling?: "mean";
    normalize?: boolean;
  }
) => Promise<Tensor>;

let featureExtractorPromise: Promise<FeatureExtractor> | null = null;

function readBooleanEnvironmentValue(name: string, defaultValue: boolean) {
  const value = process.env[name]?.trim().toLowerCase();

  if (!value) {
    return defaultValue;
  }

  if (["1", "true", "yes", "on"].includes(value)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(value)) {
    return false;
  }

  throw new EmbeddingConfigurationError(`${name} must be a boolean-like value such as true or false.`);
}

function readPositiveIntegerEnvironmentValue(name: string, defaultValue: number) {
  const value = process.env[name]?.trim();

  if (!value) {
    return defaultValue;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new EmbeddingConfigurationError(`${name} must be a positive integer.`);
  }

  return parsed;
}

function readEmbeddingDevice() {
  return process.env.EMBEDDING_DEVICE?.trim() as DeviceType | undefined;
}

function readEmbeddingDtype() {
  return (process.env.EMBEDDING_DTYPE?.trim() || DEFAULT_EMBEDDING_DTYPE) as DataType;
}

export function normalizeTextForEmbedding(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

export function getEmbeddingConfig(): EmbeddingConfig {
  const provider = (process.env.EMBEDDING_PROVIDER?.trim() || DEFAULT_EMBEDDING_PROVIDER) as EmbeddingProvider;

  if (provider !== "local-transformers") {
    throw new EmbeddingConfigurationError(
      `Unsupported embedding provider "${provider}". Supported provider: local-transformers.`
    );
  }

  return {
    provider,
    model: process.env.EMBEDDING_MODEL?.trim() || DEFAULT_EMBEDDING_MODEL,
    dimensions: readPositiveIntegerEnvironmentValue("EMBEDDING_DIMENSIONS", DEFAULT_EMBEDDING_DIMENSIONS),
    cacheDir: process.env.EMBEDDING_CACHE_DIR?.trim() || undefined,
    device: readEmbeddingDevice(),
    dtype: readEmbeddingDtype(),
    localFilesOnly: readBooleanEnvironmentValue("EMBEDDING_LOCAL_FILES_ONLY", false),
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

async function loadFeatureExtractor(config: EmbeddingConfig) {
  if (!featureExtractorPromise) {
    featureExtractorPromise = (async () => {
      const { env, pipeline } = await import("@huggingface/transformers");

      if (config.cacheDir) {
        env.cacheDir = config.cacheDir;
      }

      return pipeline("feature-extraction", config.model, {
        cache_dir: config.cacheDir,
        device: config.device,
        dtype: config.dtype,
        local_files_only: config.localFilesOnly,
      }) as Promise<FeatureExtractor>;
    })();
  }

  return featureExtractorPromise;
}

function extractEmbeddingRows(output: Tensor) {
  if (output.dims.length !== 2) {
    throw new EmbeddingProviderError(
      `Expected a pooled embedding tensor with 2 dimensions, received dims [${output.dims.join(", ")}].`
    );
  }

  const [rowCount, dimensionCount] = output.dims;
  const values = Array.from(output.data);
  const rows: number[][] = [];

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const start = rowIndex * dimensionCount;
    rows.push(values.slice(start, start + dimensionCount));
  }

  return rows;
}

/**
 * Local semantic embeddings default to `onnx-community/all-MiniLM-L6-v2-ONNX`.
 * Transformers.js documents pooled output for this model as `[1, 384]`.
 */
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
      provider: config.provider,
      model: config.model,
      dimensions: config.dimensions,
      succeeded: [],
      failed: invalidRows,
    };
  }

  const extractor = await loadFeatureExtractor(config);
  const output = await extractor(
    validRows.map((item) => item.normalizedText),
    { pooling: "mean", normalize: true }
  );
  const rows = extractEmbeddingRows(output);

  if (rows.length !== validRows.length) {
    throw new EmbeddingProviderError(
      `Embedding provider returned ${rows.length} vectors for ${validRows.length} requested texts.`
    );
  }

  const succeeded: EmbeddingSuccessRow[] = [];
  const failed = [...invalidRows];

  for (let position = 0; position < validRows.length; position += 1) {
    const row = validRows[position]!;
    const embedding = rows[position];

    if (!embedding) {
      failed.push(toFailure(row.index, row.text, row.normalizedText, "Local model returned a missing embedding row."));
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
    provider: config.provider,
    model: config.model,
    dimensions: config.dimensions,
    succeeded,
    failed,
  };
}
