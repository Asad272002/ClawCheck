"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { MailPlus, Users } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberPicker } from "@/components/workspaces/member-picker";
import type { WorkspaceMember } from "@/lib/types";

export type WorkspaceMembersPanelState = {
  error: string | null;
  success: string | null;
};

type WorkspaceMembersPanelProps = {
  members: WorkspaceMember[];
  canManage: boolean;
  workspaceSlug: string;
  action: (state: WorkspaceMembersPanelState, formData: FormData) => Promise<WorkspaceMembersPanelState>;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="rounded-xl" disabled={pending}>
      <MailPlus className="size-4" />
      {pending ? "Adding members..." : "Add members"}
    </Button>
  );
}

function MemberAvatar({ member }: { member: WorkspaceMember }) {
  if (member.avatarUrl) {
    return (
      <span
        aria-label={`${member.name} avatar`}
        className="size-11 rounded-2xl bg-cover bg-center"
        style={{ backgroundImage: `url("${member.avatarUrl}")` }}
      />
    );
  }

  return (
    <span className="flex size-11 items-center justify-center rounded-2xl bg-foreground text-sm font-semibold text-background">
      {member.name.charAt(0).toUpperCase()}
    </span>
  );
}

export function WorkspaceMembersPanel({ members, canManage, workspaceSlug, action }: WorkspaceMembersPanelProps) {
  const [state, formAction] = useActionState(action, { error: null, success: null });

  return (
    <Card className="section-panel overflow-hidden">
      <CardHeader className="border-b border-border/70 pb-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-2 text-primary">
            <Users className="size-4" />
          </div>
          <div>
            <CardTitle>Workspace members</CardTitle>
            <CardDescription>
              Owners can add registered ClawCheck users by email so they can contribute to this workspace.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 p-6">
        <div className="grid gap-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 p-3"
            >
              <MemberAvatar member={member} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{member.name}</p>
                <p className="truncate text-sm text-muted-foreground">{member.email}</p>
              </div>
              <Badge variant="outline" className="rounded-full border-border bg-background/80 capitalize">
                {member.role}
              </Badge>
            </div>
          ))}
        </div>

        {canManage ? (
          <form action={formAction} className="grid gap-4 rounded-[1.5rem] border border-border/70 bg-background/60 p-4">
            <input type="hidden" name="workspaceSlug" value={workspaceSlug} />

            {state.error ? (
              <Alert variant="destructive" className="border-destructive/30">
                <AlertTitle>Unable to add members</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            ) : null}

            {state.success ? (
              <Alert className="border-emerald-500/25 bg-emerald-500/5">
                <AlertTitle>Members updated</AlertTitle>
                <AlertDescription>{state.success}</AlertDescription>
              </Alert>
            ) : null}

            <MemberPicker
              inputId="workspace-member-emails"
              inputName="memberEmails"
              label="Add member emails"
              placeholder="Search registered teammates"
              description="Type a name or email to filter registered ClawCheck users, then select them from the dropdown."
              excludedEmails={members.map((member) => member.email)}
            />

            <div className="flex justify-end">
              <SubmitButton />
            </div>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}
