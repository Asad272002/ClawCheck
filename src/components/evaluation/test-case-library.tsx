"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TestCase } from "@/data/test-cases";

type TestCaseLibraryProps = {
  categories: Array<[string, TestCase[]]>;
};

export function TestCaseLibrary({ categories }: TestCaseLibraryProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [query, setQuery] = useState("");

  const filteredCases = useMemo(() => {
    const allCases = categories.flatMap(([category, cases]) =>
      cases.map((item) => ({ ...item, category }))
    );

    return allCases.filter((testCase) => {
      const matchesCategory =
        activeCategory === "All" || testCase.category === activeCategory;
      const matchesQuery =
        query.trim().length === 0 ||
        `${testCase.title} ${testCase.prompt} ${testCase.expectedChecks.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase());

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, categories, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="flex h-auto w-full justify-start gap-2 overflow-x-auto rounded-2xl border border-border bg-card p-2">
            <TabsTrigger value="All" className="rounded-xl px-4">All</TabsTrigger>
            {categories.map(([category]) => (
              <TabsTrigger key={category} value={category} className="rounded-xl px-4">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search test cases"
            className="rounded-xl border-border bg-background pl-9"
          />
        </div>
      </div>

      {filteredCases.length === 0 ? (
        <EmptyState
          title="No matching test cases"
          description="Try a different category or search term to find relevant prompts."
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredCases.map((testCase) => (
            <Card key={testCase.id} className="surface-card h-full">
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-full border-border bg-background/70">
                    {testCase.id}
                  </Badge>
                  <Badge className="rounded-full bg-primary/10 text-primary hover:bg-primary/10">
                    {testCase.category}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="rounded-full border-border bg-background/70"
                  >
                    {testCase.difficulty}
                  </Badge>
                </div>
                <div>
                  <CardTitle className="text-lg">{testCase.title}</CardTitle>
                  <CardDescription className="mt-1 text-sm leading-6">
                    {testCase.prompt}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm font-medium">Expected checks</p>
                <div className="flex flex-wrap gap-2">
                  {testCase.expectedChecks.map((check) => (
                    <Badge
                      key={check}
                      variant="outline"
                      className="rounded-full border-border bg-background/70"
                    >
                      {check}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
