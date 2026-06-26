import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { PageHeading } from "@/components/shared/page-heading";
import { WorkspaceSetupForm, type WorkspaceSetupFormState } from "@/components/workspaces/workspace-setup-form";
import { Card, CardContent } from "@/components/ui/card";
import { requireCurrentUser } from "@/lib/auth/user";
import {
  addWorkspaceMembersByUserIds,
  parseWorkspaceMemberEmails,
  resolveRegisteredProfilesByEmails,
} from "@/lib/db/workspace-members";
import { createSupabaseServerClient } from "@/lib/supabase/ssr";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function createWorkspaceAction(_: WorkspaceSetupFormState, formData: FormData): Promise<WorkspaceSetupFormState> {
  "use server";

  try {
    const currentUser = await requireCurrentUser();
    const supabase = await createSupabaseServerClient();

    const name = formData.get("name")?.toString().trim() ?? "";
    const agentName = formData.get("agentName")?.toString().trim() ?? "";
    const agentType = formData.get("agentType")?.toString().trim() ?? "";
    const purpose = formData.get("purpose")?.toString().trim() ?? "";
    const description = formData.get("description")?.toString().trim() ?? "";
    const team = formData.get("team")?.toString().trim() || "Personal Workspace";
    const primaryGoal = formData.get("primaryGoal")?.toString().trim() ?? "";
    const memberEmails = parseWorkspaceMemberEmails(formData.get("memberEmails")?.toString() ?? "");
    const tags = (formData.get("tags")?.toString() ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (!name || !agentName || !agentType || !purpose || !description || !primaryGoal) {
      return {
        error: "Please fill in every required workspace field before continuing.",
      };
    }

    const { profiles, missingEmails } = await resolveRegisteredProfilesByEmails(memberEmails);

    if (missingEmails.length > 0) {
      return {
        error: `These emails are not registered on ClawCheck yet: ${missingEmails.join(", ")}`,
      };
    }

    const workspaceId = `workspace-${crypto.randomUUID().slice(0, 8)}`;
    const slugBase = slugify(name) || `workspace-${Date.now()}`;
    const slug = `${slugBase}-${workspaceId.slice(-4)}`;
    const now = new Date().toISOString();

    let workspaceInsertResult = await supabase.from("workspaces").insert({
      id: workspaceId,
      slug,
      name,
      agent_name: agentName,
      agent_type: agentType,
      purpose,
      description,
      owner_name: currentUser.name,
      owner_user_id: currentUser.id,
      team,
      health: "Stable",
      primary_goal: primaryGoal,
      last_updated: now,
      tags,
    });

    if (workspaceInsertResult.error?.message?.includes("agent_type") && workspaceInsertResult.error.message.includes("does not exist")) {
      workspaceInsertResult = await supabase.from("workspaces").insert({
        id: workspaceId,
        slug,
        name,
        agent_name: agentName,
        purpose,
        description,
        owner_name: currentUser.name,
        owner_user_id: currentUser.id,
        team,
        health: "Stable",
        primary_goal: primaryGoal,
        last_updated: now,
        tags,
      });
    }

    const { error: workspaceError } = workspaceInsertResult;

    if (workspaceError) {
      return {
        error: `Unable to create workspace: ${workspaceError.message}`,
      };
    }

    const { error: membershipError } = await supabase.from("workspace_memberships").insert({
      workspace_id: workspaceId,
      user_id: currentUser.id,
      role: "owner",
      added_by: currentUser.id,
    });

    if (membershipError) {
      return {
        error: `Unable to create workspace membership: ${membershipError.message}`,
      };
    }

    await addWorkspaceMembersByUserIds({
      workspaceId,
      userIds: profiles.map((profile) => profile.id),
      addedByUserId: currentUser.id,
    });

    revalidatePath("/dashboard");
    revalidatePath("/workspaces");
    redirect(`/workspaces/${slug}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to create the workspace right now.",
    };
  }
}

export default function NewWorkspacePage() {
  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="New Workspace"
        title="Create a project workspace"
        description="Set up one tracked agent, define how that agent should be evaluated over time, and invite optional registered teammates from day one."
      />

      <Card className="section-panel overflow-hidden">
        <CardContent className="p-6">
          <WorkspaceSetupForm action={createWorkspaceAction} />
        </CardContent>
      </Card>
    </div>
  );
}
