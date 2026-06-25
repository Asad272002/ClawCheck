import { NextResponse } from "next/server";

import { getGroupedTestCases, getTestCases } from "@/lib/db/test-cases";

export async function GET() {
  const [items, categories] = await Promise.all([getTestCases(), getGroupedTestCases()]);
  return NextResponse.json({ total: items.length, categories, items });
}
