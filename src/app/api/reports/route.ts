import { NextResponse } from "next/server";

import { getReports } from "@/lib/db/reports";

export async function GET() {
  const items = await getReports();
  return NextResponse.json({ total: items.length, items });
}
