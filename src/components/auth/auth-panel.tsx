"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthPanelProps = {
  nextPath?: string;
};

type AuthMode = "signin" | "signup";

export function AuthPanel({ nextPath = "/dashboard" }: AuthPanelProps) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"google" | "email" | null>(null);

  const callbackUrl =
    typeof window === "undefined"
      ? undefined
      : `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

  const handleGoogleLogin = async () => {
    try {
      setLoading("google");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to start Google sign in.");
      setLoading(null);
    }
  };

  const handleEmailAuth = async () => {
    try {
      setLoading("email");

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          throw error;
        }

        toast.success("Signed in successfully.");
        router.push(nextPath);
        router.refresh();
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: callbackUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        throw error;
      }

      toast.success("Account created. Check your email if confirmation is required.");
      setMode("signin");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="section-panel overflow-hidden">
      <CardHeader className="space-y-3">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <ShieldCheck className="size-3.5" />
          Secure Workspace Access
        </div>
        <CardTitle className="text-2xl tracking-tight">
          {mode === "signin" ? "Sign in to your workspace" : "Create your workspace account"}
        </CardTitle>
        <CardDescription className="text-sm leading-6">
          Use Google SSO for the fastest setup, or continue with email and password for structured team access.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-xl"
          onClick={handleGoogleLogin}
          disabled={loading !== null}
        >
          {loading === "google" ? <Loader2 className="size-4 animate-spin" /> : <span className="text-base font-semibold">G</span>}
          Continue with Google
        </Button>

        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          <span>Email access</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid gap-3">
          {mode === "signup" ? (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Asad Khan"
                className="rounded-xl"
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter a secure password"
              className="rounded-xl"
            />
          </div>
        </div>

        <Button
          type="button"
          className="w-full rounded-xl"
          onClick={handleEmailAuth}
          disabled={loading !== null || email.trim().length === 0 || password.trim().length < 6 || (mode === "signup" && fullName.trim().length < 2)}
        >
          {loading === "email" ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
          {mode === "signin" ? "Sign in with email" : "Create account"}
        </Button>

        <div className="rounded-2xl border border-border bg-muted/55 p-4 text-sm text-muted-foreground">
          {mode === "signin" ? "Need an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="font-semibold text-primary"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Create one" : "Sign in instead"}
          </button>
        </div>

        <p className="text-xs leading-6 text-muted-foreground">
          By continuing, your workspace access is linked to your profile so you only see projects you own or that have been shared with you.
        </p>
        <Link href="/" className="inline-flex text-sm font-medium text-primary">
          Back to ClawCheck
        </Link>
      </CardContent>
    </Card>
  );
}
