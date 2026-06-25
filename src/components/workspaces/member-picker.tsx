"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Loader2, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { WorkspaceMemberCandidate } from "@/lib/types";

type MemberPickerProps = {
  inputName: string;
  inputId: string;
  label: string;
  description: string;
  placeholder: string;
  excludedEmails?: string[];
};

type SearchResponse = {
  items: WorkspaceMemberCandidate[];
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function CandidateAvatar({ candidate }: { candidate: WorkspaceMemberCandidate }) {
  if (candidate.avatarUrl) {
    return (
      <span
        aria-label={`${candidate.name} avatar`}
        className="size-9 rounded-2xl bg-cover bg-center"
        style={{ backgroundImage: `url("${candidate.avatarUrl}")` }}
      />
    );
  }

  return (
    <span className="flex size-9 items-center justify-center rounded-2xl bg-foreground text-xs font-semibold text-background">
      {candidate.name.charAt(0).toUpperCase()}
    </span>
  );
}

export function MemberPicker({
  inputName,
  inputId,
  label,
  description,
  placeholder,
  excludedEmails = [],
}: MemberPickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<WorkspaceMemberCandidate[]>([]);
  const [results, setResults] = useState<WorkspaceMemberCandidate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const blockedEmails = useMemo(
    () => new Set([...excludedEmails.map(normalizeEmail), ...selected.map((candidate) => normalizeEmail(candidate.email))]),
    [excludedEmails, selected]
  );

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      abortControllerRef.current?.abort();
      setResults([]);
      setLoading(false);
      setError(null);
      setOpen(false);
      return;
    }

    setLoading(true);
    setError(null);

    const controller = new AbortController();
    abortControllerRef.current?.abort();
    abortControllerRef.current = controller;

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/profiles/search?q=${encodeURIComponent(query.trim())}`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const payload = (await response.json()) as SearchResponse;
        setResults(payload.items);
        setOpen(true);
      } catch (searchError) {
        if ((searchError as Error).name === "AbortError") {
          return;
        }

        setResults([]);
        setError("Unable to search registered members right now.");
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  const visibleResults = results.filter((candidate) => !blockedEmails.has(normalizeEmail(candidate.email)));
  const serializedSelectedEmails = selected.map((candidate) => candidate.email).join(",");

  function addCandidate(candidate: WorkspaceMemberCandidate) {
    setSelected((current) => {
      const alreadySelected = current.some((item) => normalizeEmail(item.email) === normalizeEmail(candidate.email));
      return alreadySelected ? current : [...current, candidate];
    });
    setQuery("");
    setResults([]);
    setOpen(false);
    setError(null);
  }

  function removeCandidate(email: string) {
    setSelected((current) => current.filter((candidate) => normalizeEmail(candidate.email) !== normalizeEmail(email)));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && visibleResults.length > 0) {
      event.preventDefault();
      addCandidate(visibleResults[0]!);
    }

    if (event.key === "Backspace" && query.length === 0 && selected.length > 0) {
      removeCandidate(selected[selected.length - 1]!.email);
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <input type="hidden" name={inputName} value={serializedSelectedEmails} />

      <div ref={containerRef} className="relative">
        <div className="rounded-[1.5rem] border border-border/70 bg-background/70 p-3">
          <div className="flex flex-wrap gap-2">
            {selected.map((candidate) => (
              <Badge
                key={candidate.id}
                variant="outline"
                className="flex items-center gap-2 rounded-full border-border bg-background px-2 py-1"
              >
                <span className="flex size-5 items-center justify-center overflow-hidden rounded-full bg-muted text-[10px] font-semibold">
                  {candidate.avatarUrl ? (
                    <span
                      className="size-full bg-cover bg-center"
                      style={{ backgroundImage: `url("${candidate.avatarUrl}")` }}
                    />
                  ) : (
                    candidate.name.charAt(0).toUpperCase()
                  )}
                </span>
                <span className="max-w-48 truncate">{candidate.name}</span>
                <button
                  type="button"
                  onClick={() => removeCandidate(candidate.email)}
                  className="rounded-full p-0.5 text-muted-foreground transition hover:text-foreground"
                  aria-label={`Remove ${candidate.email}`}
                >
                  <X className="size-3.5" />
                </button>
              </Badge>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-2xl border border-border/70 bg-card/70 px-3">
            <Search className="size-4 text-muted-foreground" />
            <Input
              id={inputId}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="h-11 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              autoComplete="off"
            />
            {loading ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : null}
          </div>
        </div>

        {open && (query.trim().length >= 2 || error) ? (
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-[1.25rem] border border-border/80 bg-popover shadow-xl">
            <div className="max-h-72 overflow-y-auto p-2">
              {error ? <p className="px-3 py-3 text-sm text-destructive">{error}</p> : null}

              {!error && visibleResults.length === 0 && !loading ? (
                <p className="px-3 py-3 text-sm text-muted-foreground">No registered profiles matched that email or name.</p>
              ) : null}

              {!error
                ? visibleResults.map((candidate) => (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => addCandidate(candidate)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-accent",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      )}
                    >
                      <CandidateAvatar candidate={candidate} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">{candidate.name}</p>
                        <p className="truncate text-sm text-muted-foreground">{candidate.email}</p>
                      </div>
                      <Check className="size-4 text-muted-foreground" />
                    </button>
                  ))
                : null}
            </div>
          </div>
        ) : null}
      </div>

      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}
