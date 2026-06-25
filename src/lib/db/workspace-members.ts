import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { WorkspaceMember, WorkspaceMemberCandidate } from "@/lib/types";

type ProfileLookupRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

type WorkspaceMembershipRow = {
  user_id: string;
  role: "owner" | "member";
  created_at: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function parseWorkspaceMemberEmails(value: string) {
  return Array.from(new Set(value.split(/[\n,;]+/).map(normalizeEmail).filter(Boolean)));
}

export async function resolveRegisteredProfilesByEmails(emails: string[]) {
  const normalizedEmails = Array.from(new Set(emails.map(normalizeEmail).filter(Boolean)));

  if (normalizedEmails.length === 0) {
    return {
      profiles: [] as ProfileLookupRow[],
      missingEmails: [] as string[],
    };
  }

  // Supabase admin queries are intentionally cast until Database types are generated for the project.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getSupabaseAdmin() as any;
  const { data, error } = await admin.from("profiles").select("id, email, full_name, avatar_url").in("email", normalizedEmails);

  if (error) {
    throw new Error(`Unable to validate member emails: ${error.message}`);
  }

  const profiles = ((data ?? []) as ProfileLookupRow[]).filter((profile) => profile.email);
  const matchedProfiles = new Map(profiles.map((profile) => [normalizeEmail(profile.email!), profile]));
  const missingEmails = normalizedEmails.filter((email) => !matchedProfiles.has(email));

  return {
    profiles: normalizedEmails
      .map((email) => matchedProfiles.get(email))
      .filter((profile): profile is ProfileLookupRow => Boolean(profile)),
    missingEmails,
  };
}

export async function searchRegisteredProfiles(query: string, excludeUserId?: string): Promise<WorkspaceMemberCandidate[]> {
  const normalizedQuery = query.trim().replace(/[%_,'\\]/g, "");

  if (normalizedQuery.length < 2) {
    return [];
  }

  // Supabase admin queries are intentionally cast until Database types are generated for the project.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getSupabaseAdmin() as any;
  let lookup = admin
    .from("profiles")
    .select("id, email, full_name, avatar_url")
    .or(`email.ilike.%${normalizedQuery}%,full_name.ilike.%${normalizedQuery}%`)
    .limit(8);

  if (excludeUserId) {
    lookup = lookup.neq("id", excludeUserId);
  }

  const { data, error } = await lookup;

  if (error) {
    throw new Error(`Unable to search member emails: ${error.message}`);
  }

  return ((data ?? []) as ProfileLookupRow[])
    .filter((profile) => profile.email)
    .map((profile) => ({
      id: profile.id,
      email: profile.email ?? "",
      name: profile.full_name?.trim() || profile.email?.split("@")[0] || "Workspace member",
      avatarUrl: profile.avatar_url,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function addWorkspaceMembersByUserIds({
  workspaceId,
  userIds,
  addedByUserId,
}: {
  workspaceId: string;
  userIds: string[];
  addedByUserId: string;
}) {
  const uniqueUserIds = Array.from(new Set(userIds.filter(Boolean))).filter((userId) => userId !== addedByUserId);

  if (uniqueUserIds.length === 0) {
    return {
      addedCount: 0,
      existingCount: 0,
    };
  }

  // Supabase admin queries are intentionally cast until Database types are generated for the project.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getSupabaseAdmin() as any;
  const { data: existingMemberships, error: existingMembershipsError } = await admin
    .from("workspace_memberships")
    .select("user_id")
    .eq("workspace_id", workspaceId);

  if (existingMembershipsError) {
    throw new Error(`Unable to check existing workspace members: ${existingMembershipsError.message}`);
  }

  const existingUserIds = new Set(((existingMemberships ?? []) as Array<{ user_id: string }>).map((membership) => membership.user_id));
  const newUserIds = uniqueUserIds.filter((userId) => !existingUserIds.has(userId));

  if (newUserIds.length === 0) {
    return {
      addedCount: 0,
      existingCount: uniqueUserIds.length,
    };
  }

  const { error: membershipError } = await admin.from("workspace_memberships").upsert(
    newUserIds.map((userId) => ({
      workspace_id: workspaceId,
      user_id: userId,
      role: "member",
      added_by: addedByUserId,
    })),
    { onConflict: "workspace_id,user_id" }
  );

  if (membershipError) {
    throw new Error(`Unable to add workspace members: ${membershipError.message}`);
  }

  return {
    addedCount: newUserIds.length,
    existingCount: uniqueUserIds.length - newUserIds.length,
  };
}

export async function fetchWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  // Supabase admin queries are intentionally cast until Database types are generated for the project.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getSupabaseAdmin() as any;
  const { data: membershipData, error: membershipError } = await admin
    .from("workspace_memberships")
    .select("user_id, role, created_at")
    .eq("workspace_id", workspaceId);

  if (membershipError) {
    throw new Error(`Unable to load workspace members: ${membershipError.message}`);
  }

  const memberships = (membershipData ?? []) as WorkspaceMembershipRow[];
  const userIds = memberships.map((membership) => membership.user_id);

  if (userIds.length === 0) {
    return [];
  }

  const { data: profileData, error: profileError } = await admin
    .from("profiles")
    .select("id, email, full_name, avatar_url")
    .in("id", userIds);

  if (profileError) {
    throw new Error(`Unable to load workspace member profiles: ${profileError.message}`);
  }

  const profilesById = new Map(((profileData ?? []) as ProfileLookupRow[]).map((profile) => [profile.id, profile]));

  return memberships
    .map((membership) => {
      const profile = profilesById.get(membership.user_id);

      if (!profile) {
        return null;
      }

      return {
        id: membership.user_id,
        email: profile.email ?? "",
        name: profile.full_name?.trim() || profile.email?.split("@")[0] || "Workspace member",
        avatarUrl: profile.avatar_url,
        role: membership.role,
        joinedAt: membership.created_at,
      } satisfies WorkspaceMember;
    })
    .filter((member): member is WorkspaceMember => Boolean(member))
    .sort((left, right) => {
      if (left.role !== right.role) {
        return left.role === "owner" ? -1 : 1;
      }

      return left.name.localeCompare(right.name);
    });
}
