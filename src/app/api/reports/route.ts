import { NextResponse } from "next/server";

import { getOptionalCurrentUser } from "@/lib/auth/user";
import { getReports } from "@/lib/db/reports";

export async function GET() {
  const currentUser = await getOptionalCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ message: "You must be signed in to view reports." }, { status: 401 });
  }

  const items = await getReports();
  return NextResponse.json({ total: items.length, items });
}
