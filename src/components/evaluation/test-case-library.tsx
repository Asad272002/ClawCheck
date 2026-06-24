"use client";

import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Difficulty } from "@/lib/types";
import type { TestCase } from "@/data/test-cases";
import { cn } from "@/lib/utils";

type TestCaseLibraryProps = {
  categories: Array<[string, TestCase[]]>;
};

const difficultyOptions: Array<"All" | Difficulty> = ["All", "Easy", "Medium", "Hard"];

function truncate(text: string, maxLength: number) {
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
}

export function TestCaseLibrary({ categories }: TestCaseLibraryProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeDifficulty, setActiveDifficulty] = useState<"All" | Difficulty>("All");
  const [query, setQuery] = useState("");

  const allCases = useMemo(
    () => categories.flatMap(([category, cases]) => cases.map((item) => ({ ...item, category }))),
    [categories]
  );

  const categoryCounts = useMemo(
    () =>
      new Map<string, number>([
        ["All", allCases.length],
        ...categories.map(
          ([category, cases]) => [category, cases.length] as [string, number]
        ),
      ]),
    [allCases.length, categories]
  );

  const filteredCases = useMemo(() => {
    return allCases.filter((testCase) => {
      const matchesCategory =
        activeCategory === "All" || testCase.category === activeCategory;
      const matchesDifficulty =
        activeDifficulty === "All" || testCase.difficulty === activeDifficulty;
      const matchesQuery =
        query.trim().length === 0 ||
        `${testCase.title} ${testCase.prompt} ${testCase.expectedChecks.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase());

      return matchesCategory && matchesDifficulty && matchesQuery;
    });
  }, [activeCategory, activeDifficulty, allCases, query]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="surface-card">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm font-medium text-muted-foreground">Total cases</p>
            <p className="text-3xl font-semibold tracking-tight">{allCases.length}</p>
            <p className="text-sm text-muted-foreground">Ready-to-run prompt scenarios.</p>
          </CardContent>
        </Card>
        <Card className="surface-card">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm font-medium text-muted-foreground">Categories</p>
            <p className="text-3xl font-semibold tracking-tight">{categories.length}</p>
            <p className="text-sm text-muted-foreground">Privacy, bias, misuse, and more.</p>
          </CardContent>
        </Card>
        <Card className="surface-card">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm font-medium text-muted-foreground">Showing</p>
            <p className="text-3xl font-semibold tracking-tight">{filteredCases.length}</p>
            <p className="text-sm text-muted-foreground">Filtered cases after search and difficulty.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="surface-card">
        <CardContent className="space-y-5 p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by scenario, risk, or prompt"
                className="rounded-xl border-border bg-background pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <SlidersHorizontal className="size-4" />
                Difficulty
              </div>
              {difficultyOptions.map((difficulty) => (
                <button
                  key={difficulty}
                  type="button"
                  onClick={() => setActiveDifficulty(difficulty)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition",
                    activeDifficulty === difficulty
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {["All", ...categories.map(([category]) => category)].map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition",
                  activeCategory === category
                    ? "bg-primary/10 text-primary ring-1 ring-primary/15"
                    : "bg-muted/70 text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <span>{category}</span>
                <span className="rounded-full bg-background/80 px-2 py-0.5 text-xs text-muted-foreground">
                  {categoryCounts.get(category) ?? 0}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredCases.length === 0 ? (
        <EmptyState
          title="No matching test cases"
          description="Try a different category, difficulty, or search term to find a better prompt."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filteredCases.map((testCase) => (
            <Card key={testCase.id} className="surface-card h-full">
              <CardContent className="flex h-full flex-col gap-4 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-full border-border bg-background/80">
                    {testCase.id}
                  </Badge>
                  <Badge className="rounded-full bg-primary/10 text-primary hover:bg-primary/10">
                    {testCase.category}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full border-border bg-background/80",
                      testCase.difficulty === "Easy" && "text-emerald-600 dark:text-emerald-400",
                      testCase.difficulty === "Medium" && "text-amber-600 dark:text-amber-400",
                      testCase.difficulty === "Hard" && "text-red-600 dark:text-red-400"
                    )}
                  >
                    {testCase.difficulty}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold tracking-tight">{testCase.title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {truncate(testCase.prompt, 138)}
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Expected checks</p>
                  <div className="flex flex-wrap gap-2">
                    {testCase.expectedChecks.slice(0, 3).map((check) => (
                      <Badge
                        key={check}
                        variant="outline"
                        className="rounded-full border-border bg-background/80"
                      >
                        {check}
                      </Badge>
                    ))}
                    {testCase.expectedChecks.length > 3 ? (
                      <Badge variant="outline" className="rounded-full border-border bg-background/80">
                        +{testCase.expectedChecks.length - 3} more
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                  <p className="text-xs text-muted-foreground">
                    Designed for quick red-team style reviews.
                  </p>
                  <Link
                    href="/evaluations/new"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl")}
                  >
                    Use case
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
