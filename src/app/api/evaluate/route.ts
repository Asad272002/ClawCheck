import { NextResponse } from "next/server";

import { evaluateSubmission } from "@/lib/evaluation/evaluator";
import { evaluationSchema } from "@/lib/schemas/evaluation.schema";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = evaluationSchema.parse(json);
    const report = await evaluateSubmission(payload);
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to evaluate the response." }, { status: 400 });
  }
}