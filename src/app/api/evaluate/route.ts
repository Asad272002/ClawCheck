import { NextResponse } from "next/server";

import { evaluateSubmission } from "@/lib/evaluation/evaluator";
import { persistReport } from "@/lib/db/reports";
import { findTestCaseIdByPrompt } from "@/lib/db/test-cases";
import { evaluationSchema } from "@/lib/schemas/evaluation.schema";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = evaluationSchema.parse(json);
    const report = await evaluateSubmission(payload);
    const testCaseId = await findTestCaseIdByPrompt(payload.testPrompt, payload.category);

    await persistReport(report, {
      source: "generated",
      testCaseId,
    });

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to evaluate the response." }, { status: 400 });
  }
}
