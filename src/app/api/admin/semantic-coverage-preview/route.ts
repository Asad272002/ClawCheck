import { NextRequest, NextResponse } from "next/server";

import {
  classifySemanticCoverageForReport,
  getSemanticCoverageVerificationSeed,
} from "@/lib/semantic/coverage";

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
        message: "Semantic coverage preview is not configured. Set SEMANTIC_REINDEX_TOKEN on the server before running this route.",
      },
      { status: 503 }
    );
  }

  const bearerToken = readBearerToken(request);

  if (!bearerToken || bearerToken !== configuredToken) {
    return NextResponse.json({ message: "Unauthorized semantic coverage preview request." }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      reportId?: string;
    };

    const seed =
      body.reportId?.trim()
        ? { reportId: body.reportId.trim() }
        : await getSemanticCoverageVerificationSeed();

    if (!seed) {
      return NextResponse.json(
        {
          ok: false,
          message: "No report is available for semantic coverage verification.",
        },
        { status: 404 }
      );
    }

    const result = await classifySemanticCoverageForReport(seed.reportId);

    return NextResponse.json({
      ok: true,
      reportId: seed.reportId,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Semantic coverage preview failed.",
      },
      { status: 500 }
    );
  }
}
