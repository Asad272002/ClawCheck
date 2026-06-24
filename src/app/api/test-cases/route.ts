import { NextResponse } from "next/server";

import { TEST_CASES, TEST_CASES_BY_CATEGORY } from "@/data/test-cases";

export async function GET() {
  return NextResponse.json({ total: TEST_CASES.length, categories: TEST_CASES_BY_CATEGORY, items: TEST_CASES });
}