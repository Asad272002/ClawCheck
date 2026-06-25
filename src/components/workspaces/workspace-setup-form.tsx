"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, MailPlus, ShieldCheck, Sparkles } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MemberPicker } from "@/components/workspaces/member-picker";

export type WorkspaceSetupFormState = {
  error: string | null;
};

type WorkspaceSetupFormProps = {
  action: (state: WorkspaceSetupFormState, formData: FormData) => Promise<WorkspaceSetupFormState>;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="rounded-xl px-5" disabled={pending}>
      <Sparkles className="size-4" />
      {pending ? "Creating workspace..." : "Create workspace"}
    </Button>
  );
}

export function WorkspaceSetupForm({ action }: WorkspaceSetupFormProps) {
  const [state, formAction] = useActionState(action, { error: null });

  return (
    <form action={formAction} className="grid gap-6">
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="surface-card border-border/70">
          <CardContent className="flex items-start gap-3 p-5">
            <div className="rounded-2xl bg-primary/10 p-2 text-primary">
              <ShieldCheck className="size-4" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Owner-controlled access</p>
              <p className="text-sm leading-6 text-muted-foreground">Only workspace owners can add members and manage contributions.</p>
            </div>
          </CardContent>
        </Card>
        <Card className="surface-card border-border/70">
          <CardContent className="flex items-start gap-3 p-5">
            <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <MailPlus className="size-4" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Invite by registered email</p>
              <p className="text-sm leading-6 text-muted-foreground">Only people who already signed up to ClawCheck can be added as members.</p>
            </div>
          </CardContent>
        </Card>
        <Card className="surface-card border-border/70">
          <CardContent className="flex items-start gap-3 p-5">
            <div className="rounded-2xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="size-4" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Ready for contribution</p>
              <p className="text-sm leading-6 text-muted-foreground">Members can join the same workspace after creation and contribute to its progress.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {state.error ? (
        <Alert variant="destructive" className="border-destructive/30">
          <AlertTitle>Workspace setup needs attention</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="section-panel overflow-hidden">
        <CardHeader className="border-b border-border/70 pb-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full border-border bg-background/70">
              Step 1
            </Badge>
            <CardTitle>Project basics</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Workspace name</Label>
              <Input id="name" name="name" placeholder="GuardianOps Support Agent" className="h-11 rounded-xl px-4" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agentName">Agent name</Label>
              <Input id="agentName" name="agentName" placeholder="GuardianOps" className="h-11 rounded-xl px-4" required />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="team">Team</Label>
              <Input id="team" name="team" placeholder="Safety Review" className="h-11 rounded-xl px-4" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" name="tags" placeholder="Privacy, Human Oversight, Confidence" className="h-11 rounded-xl px-4" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="section-panel overflow-hidden">
        <CardHeader className="border-b border-border/70 pb-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full border-border bg-background/70">
              Step 2
            </Badge>
            <CardTitle>How this workspace should be used</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="purpose">Agent purpose</Label>
            <Textarea
              id="purpose"
              name="purpose"
              rows={3}
              placeholder="Support agent for policy-sensitive customer questions in regulated workflows."
              className="rounded-2xl px-4 py-3"
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
              className="rounded-2xl px-4 py-3"
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
              className="rounded-2xl px-4 py-3"
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card className="section-panel overflow-hidden">
        <CardHeader className="border-b border-border/70 pb-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full border-border bg-background/70">
              Step 3
            </Badge>
            <CardTitle>Add collaborators</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-6">
          <MemberPicker
            inputId="memberEmails"
            inputName="memberEmails"
            label="Member emails"
            placeholder="Search by name or email"
            description="Optional. Type a name or email to find registered ClawCheck users, then click to add them."
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
