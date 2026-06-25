import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { PageHeading } from "@/components/shared/page-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireCurrentUser } from "@/lib/auth/user";
import { createSupabaseServerClient } from "@/lib/supabase/ssr";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function createWorkspaceAction(formData: FormData) {
  "use server";

  const currentUser = await requireCurrentUser();
  const supabase = await createSupabaseServerClient();

  const name = formData.get("name")?.toString().trim() ?? "";
  const agentName = formData.get("agentName")?.toString().trim() ?? "";
  const purpose = formData.get("purpose")?.toString().trim() ?? "";
  const description = formData.get("description")?.toString().trim() ?? "";
  const team = formData.get("team")?.toString().trim() || "Personal Workspace";
  const primaryGoal = formData.get("primaryGoal")?.toString().trim() ?? "";
  const tags = (formData.get("tags")?.toString() ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!name || !agentName || !purpose || !description || !primaryGoal) {
    throw new Error("Please fill in all required workspace fields.");
  }

  const workspaceId = `workspace-${crypto.randomUUID().slice(0, 8)}`;
  const slugBase = slugify(name) || `workspace-${Date.now()}`;
  const slug = `${slugBase}-${workspaceId.slice(-4)}`;
  const now = new Date().toISOString();

  const { error: workspaceError } = await supabase.from("workspaces").insert({
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

  if (workspaceError) {
    throw new Error(`Unable to create workspace: ${workspaceError.message}`);
  }

  const { error: membershipError } = await supabase.from("workspace_memberships").insert({
    workspace_id: workspaceId,
    user_id: currentUser.id,
    role: "owner",
    added_by: currentUser.id,
  });

  if (membershipError) {
    throw new Error(`Unable to create workspace membership: ${membershipError.message}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/workspaces");
  redirect(`/workspaces/${slug}`);
}

export default function NewWorkspacePage() {
  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="New Workspace"
        title="Create a project workspace"
        description="Set up an AI agent project that belongs to your account so only you and future shared members can access it."
      />

      <Card className="section-panel overflow-hidden">
        <CardContent className="p-6">
          <form action={createWorkspaceAction} className="grid gap-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Workspace name</Label>
                <Input id="name" name="name" placeholder="GuardianOps Support Agent" className="rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agentName">Agent name</Label>
                <Input id="agentName" name="agentName" placeholder="GuardianOps" className="rounded-xl" required />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="team">Team</Label>
                <Input id="team" name="team" placeholder="Safety Review" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input id="tags" name="tags" placeholder="Privacy, Human Oversight, Confidence" className="rounded-xl" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Agent purpose</Label>
              <Textarea
                id="purpose"
                name="purpose"
                rows={3}
                placeholder="Support agent for policy-sensitive customer questions in regulated workflows."
                className="rounded-2xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Workspace description</Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Explain what this project tracks, what you want to improve, and how evaluations should help the team."
                className="rounded-2xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryGoal">Primary improvement goal</Label>
              <Textarea
                id="primaryGoal"
                name="primaryGoal"
                rows={3}
                placeholder="Raise the average safety score above 88 while reducing repeated privacy gaps."
                className="rounded-2xl"
                required
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="rounded-xl px-5">
                Create Workspace
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
