import "server-only";

import { redirect } from "next/navigation";

import { getSupabaseAdmin } from "@/lib/supabase/server";
import { createSupabaseServerClient } from "@/lib/supabase/ssr";

export type AppUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
};

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

function deriveDisplayName(email: string | undefined, fullName: string | null | undefined) {
  if (fullName && fullName.trim().length > 0) {
    return fullName;
  }

  if (email && email.includes("@")) {
    return email.split("@")[0]!;
  }

  return "Workspace User";
}

async function syncProfileAndClaimLegacyAccess(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
  const admin = getSupabaseAdmin();
  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : deriveDisplayName(user.email, null);
  const avatarUrl =
    typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null;

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      full_name: fullName,
      avatar_url: avatarUrl,
    },
    { onConflict: "id" }
  );

  if (profileError) {
    throw new Error(`Unable to sync profile: ${profileError.message}`);
  }

  const { error: claimError } = await admin
    .from("workspaces")
    .update({ owner_user_id: user.id })
    .is("owner_user_id", null)
    .eq("owner_name", fullName);

  if (claimError) {
    throw new Error(`Unable to claim legacy workspaces: ${claimError.message}`);
  }

  const { data: ownedWorkspaces, error: ownedError } = await admin
    .from("workspaces")
    .select("id")
    .eq("owner_user_id", user.id);

  if (ownedError) {
    throw new Error(`Unable to load owned workspaces: ${ownedError.message}`);
  }

  if ((ownedWorkspaces ?? []).length > 0) {
    const { error: membershipError } = await admin.from("workspace_memberships").upsert(
      ownedWorkspaces!.map((workspace) => ({
        workspace_id: workspace.id,
        user_id: user.id,
        role: "owner",
        added_by: user.id,
      })),
      { onConflict: "workspace_id,user_id" }
    );

    if (membershipError) {
      throw new Error(`Unable to sync workspace memberships: ${membershipError.message}`);
    }
  }
}

async function buildCurrentUser(redirectOnMissing: boolean) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (redirectOnMissing) {
      redirect("/login");
    }

    return null;
  }

  await syncProfileAndClaimLegacyAccess(user);

  const admin = getSupabaseAdmin();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("id, email, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error(`Unable to load user profile: ${error.message}`);
  }

  const typedProfile = profile as ProfileRow;

  return {
    id: user.id,
    email: typedProfile.email ?? user.email ?? "",
    name: deriveDisplayName(user.email, typedProfile.full_name),
    avatarUrl: typedProfile.avatar_url,
  } satisfies AppUser;
}

export async function getOptionalCurrentUser() {
  return buildCurrentUser(false);
}

export async function requireCurrentUser() {
  const user = await buildCurrentUser(true);
  return user!;
}
