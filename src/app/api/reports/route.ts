import { NextResponse } from "next/server";

import { SAMPLE_REPORTS } from "@/data/sample-reports";

export async function GET() {
  return NextResponse.json({ total: SAMPLE_REPORTS.length, items: SAMPLE_REPORTS });
}