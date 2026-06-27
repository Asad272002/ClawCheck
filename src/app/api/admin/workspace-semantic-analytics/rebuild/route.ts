import { NextRequest, NextResponse } from "next/server";

import { rebuildWorkspaceSemanticAnalytics } from "@/lib/semantic/workspace-analytics";

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
        message:
          "Workspace semantic analytics rebuild is not configured. Set SEMANTIC_REINDEX_TOKEN on the server before running this route.",
      },
      { status: 503 }
    );
  }

  const bearerToken = readBearerToken(request);

  if (!bearerToken || bearerToken !== configuredToken) {
    return NextResponse.json({ message: "Unauthorized workspace semantic analytics rebuild request." }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      workspaceId?: string;
      includeEmpty?: boolean;
    };

    const report = await rebuildWorkspaceSemanticAnalytics({
      workspaceId: body.workspaceId?.trim() || undefined,
      includeEmpty: Boolean(body.includeEmpty),
    });

    return NextResponse.json({
      ok: true,
      report,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Workspace semantic analytics rebuild failed.",
      },
      { status: 500 }
    );
  }
}
