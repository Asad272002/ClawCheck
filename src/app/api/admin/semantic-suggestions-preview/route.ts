import { NextRequest, NextResponse } from "next/server";

import { composeSemanticSuggestions } from "@/lib/semantic/suggestions";

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
        message: "Semantic suggestions preview is not configured. Set SEMANTIC_REINDEX_TOKEN on the server before running this route.",
      },
      { status: 503 }
    );
  }

  const bearerToken = readBearerToken(request);

  if (!bearerToken || bearerToken !== configuredToken) {
    return NextResponse.json({ message: "Unauthorized semantic suggestions preview request." }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      reportId?: string;
      testCaseId?: string;
      agentResponse?: string;
      workspaceId?: string;
      category?: string;
      deterministicScore?: number;
      deterministicStatus?: string;
      deterministicRiskLevel?: string;
    };

    const result = await composeSemanticSuggestions({
      reportId: body.reportId?.trim() || undefined,
      testCaseId: body.testCaseId?.trim() || undefined,
      agentResponse: body.agentResponse?.trim() || undefined,
      workspaceId: body.workspaceId?.trim() || undefined,
      category: body.category?.trim() || undefined,
      deterministicScore: body.deterministicScore,
      deterministicStatus: body.deterministicStatus?.trim() || undefined,
      deterministicRiskLevel: body.deterministicRiskLevel?.trim() || undefined,
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Semantic suggestions preview failed.",
      },
      { status: 500 }
    );
  }
}
