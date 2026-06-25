import { NextRequest, NextResponse } from "next/server";

import { getOptionalCurrentUser } from "@/lib/auth/user";
import { searchRegisteredProfiles } from "@/lib/db/workspace-members";

export async function GET(request: NextRequest) {
  const currentUser = await getOptionalCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ message: "You must be signed in to search for members." }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ items: [] });
  }

  const items = await searchRegisteredProfiles(query, currentUser.id);
  return NextResponse.json({ items });
}
