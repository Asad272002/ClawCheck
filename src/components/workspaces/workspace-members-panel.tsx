"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { MailPlus, ShieldCheck, UserPlus2, Users } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MemberPicker } from "@/components/workspaces/member-picker";
import type { WorkspaceMember } from "@/lib/types";

export type WorkspaceMembersPanelState = {
  error: string | null;
  success: string | null;
};

type SharedProps = {
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

function MemberAvatar({
  member,
  className = "size-8 rounded-full",
  fallbackClassName = "size-8 rounded-full text-xs",
}: {
  member: WorkspaceMember;
  className?: string;
  fallbackClassName?: string;
}) {
  if (member.avatarUrl) {
    return (
      <span
        aria-label={`${member.name} avatar`}
        className={`${className} bg-cover bg-center`}
        style={{ backgroundImage: `url("${member.avatarUrl}")` }}
      />
    );
  }

  return (
    <span className={`flex items-center justify-center bg-foreground font-semibold text-background ${fallbackClassName}`}>
      {member.name.charAt(0).toUpperCase()}
    </span>
  );
}

export function WorkspaceMembersSummary({ members }: Pick<SharedProps, "members">) {
  const visibleMembers = members.slice(0, 6);
  const remainingCount = Math.max(0, members.length - visibleMembers.length);

  return (
    <div className="flex flex-col gap-3 rounded-[1.5rem] border border-border/80 bg-card/90 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">Workspace members</p>
        <p className="text-sm text-muted-foreground">A quick view of who can access this workspace and what role they have.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {visibleMembers.map((member) => (
          <div
            key={member.id}
            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-2.5 py-2 pr-3"
          >
            <MemberAvatar member={member} />
            <div className="min-w-0">
              <p className="max-w-32 truncate text-sm font-medium text-foreground">{member.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
            </div>
          </div>
        ))}

        {remainingCount > 0 ? (
          <Badge variant="outline" className="rounded-full border-border bg-background/80 px-3 py-2">
            +{remainingCount} more
          </Badge>
        ) : null}
      </div>
    </div>
  );
}

export function WorkspaceMembersTrigger({ members, canManage, workspaceSlug, action }: SharedProps) {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const owners = members.filter((member) => member.role === "owner");
  const teammates = members.filter((member) => member.role === "member");
  const [state, formAction] = useActionState(
    async (currentState: WorkspaceMembersPanelState, formData: FormData) => {
      const nextState = await action(currentState, formData);

      if (nextState.success) {
        setIsComposerOpen(false);
      }

      return nextState;
    },
    { error: null, success: null }
  );

  if (!canManage) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        className="rounded-xl"
        onClick={() => setIsComposerOpen((current) => !current)}
      >
        <UserPlus2 className="size-4" />
        Add members
      </Button>

      {isComposerOpen ? (
        <div className="absolute right-0 top-full z-30 mt-3 w-[min(30rem,calc(100vw-2rem))] rounded-[1.5rem] border border-border/80 bg-popover/98 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.2)] backdrop-blur">
          <form action={formAction} className="grid gap-4">
            <input type="hidden" name="workspaceSlug" value={workspaceSlug} />

            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Add members</p>
              <p className="text-sm text-muted-foreground">
                Search by registered email or name, then add teammates to this workspace.
              </p>
            </div>

            {state.success ? (
              <Alert className="border-emerald-500/25 bg-emerald-500/5">
                <AlertTitle>Members updated</AlertTitle>
                <AlertDescription>{state.success}</AlertDescription>
              </Alert>
            ) : null}

            {state.error ? (
              <Alert variant="destructive" className="border-destructive/30">
                <AlertTitle>Unable to add members</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            ) : null}

            <MemberPicker
              inputId="workspace-member-emails"
              inputName="memberEmails"
              placeholder="Type teammate email or name"
              excludedEmails={members.map((member) => member.email)}
            />

            <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <ShieldCheck className="size-4 text-primary" />
                  {owners.length} owner{owners.length === 1 ? "" : "s"}
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Users className="size-4 text-primary" />
                  {teammates.length} teammate{teammates.length === 1 ? "" : "s"}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-2.5 py-2 pr-3"
                  >
                    <MemberAvatar member={member} />
                    <div className="min-w-0">
                      <p className="max-w-28 truncate text-sm font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setIsComposerOpen(false)}>
                Cancel
              </Button>
              <SubmitButton />
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
