import { NextRequest, NextResponse } from "next/server";

import {
  previewSemanticReindex,
  runSemanticReindex,
} from "@/lib/semantic/reindex";

function readBearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization") ?? "";

  if (!authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}

export async function POST(request: NextRequest) {
  const configuredToken = process.env.SEMANTIC_REINDEX_TOKEN?.trim();

  if (!configuredToken) {
    return NextResponse.json(
      {
        message: "Semantic reindex is not configured. Set SEMANTIC_REINDEX_TOKEN on the server before running this route.",
      },
      { status: 503 }
    );
  }

  const bearerToken = readBearerToken(request);

  if (!bearerToken || bearerToken !== configuredToken) {
    return NextResponse.json({ message: "Unauthorized semantic reindex request." }, { status: 401 });
  }

  let body: { force?: boolean; batchSize?: number } = {};

  try {
    body = (await request.json().catch(() => ({}))) as { force?: boolean; batchSize?: number };
    const report = await runSemanticReindex(body);

    return NextResponse.json({
      ok: true,
      report,
    });
  } catch (error) {
    const preview = await previewSemanticReindex(body).catch(() => null);

    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Semantic reindex failed.",
        preview,
      },
      { status: 500 }
    );
  }
}
