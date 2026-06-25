import { NextResponse } from "next/server";

import { getOptionalCurrentUser } from "@/lib/auth/user";
import { getGroupedTestCases, getTestCases } from "@/lib/db/test-cases";

export async function GET() {
  const currentUser = await getOptionalCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ message: "You must be signed in to view test cases." }, { status: 401 });
  }

  const [items, categories] = await Promise.all([getTestCases(), getGroupedTestCases()]);
  return NextResponse.json({ total: items.length, categories, items });
}
