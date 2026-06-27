import { NextResponse } from "next/server";

import { getOptionalCurrentUser } from "@/lib/auth/user";
import { evaluateSubmission } from "@/lib/evaluation/evaluator";
import { persistReport } from "@/lib/db/reports";
import { findTestCaseIdByPrompt } from "@/lib/db/test-cases";
import { evaluationSchema } from "@/lib/schemas/evaluation.schema";
import { composeSemanticSuggestions } from "@/lib/semantic/suggestions";
import { createSupabaseServerClient } from "@/lib/supabase/ssr";

function isMissingAgentTypeColumn(message: string | undefined) {
  if (!message) {
    return false;
  }

  return message.includes("agent_type") && message.includes("does not exist");
}

export async function POST(request: Request) {
  try {
    const currentUser = await getOptionalCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "You must be signed in to run evaluations." }, { status: 401 });
    }

    const json = await request.json();
    const payload = evaluationSchema.parse(json);
    const supabase = await createSupabaseServerClient();
    let normalizedPayload = payload;

    if (payload.workspaceId) {
      let workspaceResult = await supabase
        .from("workspaces")
        .select("id, agent_name, agent_type, purpose")
        .eq("id", payload.workspaceId)
        .single();

      if (workspaceResult.error && isMissingAgentTypeColumn(workspaceResult.error.message)) {
        workspaceResult = await supabase
          .from("workspaces")
          .select("id, agent_name, purpose")
          .eq("id", payload.workspaceId)
          .single();
      }

      const { data: workspace, error: workspaceError } = workspaceResult;

      if (workspaceError || !workspace) {
        return NextResponse.json({ message: "The selected workspace could not be loaded." }, { status: 400 });
      }

      normalizedPayload = {
        ...payload,
        agentName: workspace.agent_name,
        agentType: ("agent_type" in workspace ? workspace.agent_type : undefined)?.trim() || payload.agentType,
        agentPurpose: workspace.purpose,
      };
    }

    const report = await evaluateSubmission(normalizedPayload);
    const testCaseId = await findTestCaseIdByPrompt(normalizedPayload.testPrompt, normalizedPayload.category);
    let semanticInsights = null;
    let semanticWarning: string | null = null;

    if (testCaseId) {
      try {
        semanticInsights = await composeSemanticSuggestions({
          testCaseId,
          agentResponse: normalizedPayload.agentResponse,
          workspaceId: normalizedPayload.workspaceId,
          category: normalizedPayload.category,
          deterministicScore: report.finalScore,
          deterministicStatus: report.status,
          deterministicRiskLevel: report.riskLevel,
        });
      } catch (semanticError) {
        semanticWarning = "Semantic insights were unavailable for this evaluation.";
        console.error("Semantic suggestion composition failed:", semanticError);
      }
    } else {
      semanticWarning = "Semantic insights were skipped because the evaluation could not be linked to a test case.";
    }

    await persistReport(report, {
      source: "generated",
      testCaseId,
      workspaceId: normalizedPayload.workspaceId,
      createdBy: currentUser.id,
      semanticInsights,
    });

    return NextResponse.json({
      ...report,
      semanticInsights,
      semanticWarning,
    });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to evaluate the response." }, { status: 400 });
  }
}
