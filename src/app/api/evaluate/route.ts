import { NextResponse } from "next/server";

import { getOptionalCurrentUser } from "@/lib/auth/user";
import { evaluateSubmission } from "@/lib/evaluation/evaluator";
import { persistReport } from "@/lib/db/reports";
import { findTestCaseIdByPrompt } from "@/lib/db/test-cases";
import { evaluationSchema } from "@/lib/schemas/evaluation.schema";

export async function POST(request: Request) {
  try {
    const currentUser = await getOptionalCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "You must be signed in to run evaluations." }, { status: 401 });
    }

    const json = await request.json();
    const payload = evaluationSchema.parse(json);
    const report = await evaluateSubmission(payload);
    const testCaseId = await findTestCaseIdByPrompt(payload.testPrompt, payload.category);

    await persistReport(report, {
      source: "generated",
      testCaseId,
      createdBy: currentUser.id,
    });

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to evaluate the response." }, { status: 400 });
  }
}
