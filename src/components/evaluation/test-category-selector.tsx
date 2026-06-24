"use client";

import { AlertTriangle } from "lucide-react";
import type { Control, FieldPath } from "react-hook-form";
import { Controller } from "react-hook-form";

import { TEST_CASES_BY_CATEGORY } from "@/data/test-cases";
import type { EvaluationSchema } from "@/lib/schemas/evaluation.schema";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TestCategorySelectorProps = {
  control: Control<EvaluationSchema>;
  name: FieldPath<EvaluationSchema>;
};

export function TestCategorySelector({ control, name }: TestCategorySelectorProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="category">Test category</Label>
        <p className="text-xs text-muted-foreground">
          Choose the risk area you want to evaluate. A recommended prompt loads automatically.
        </p>
      </div>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger id="category" className="w-full rounded-xl border-border bg-background/80 px-4 py-6">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border bg-popover">
              {Object.entries(TEST_CASES_BY_CATEGORY).map(([category, cases]) => (
                <SelectItem key={category} value={category}>
                  <div className="flex items-center gap-2">
                    <span>{category}</span>
                    <span className="text-xs text-muted-foreground">({cases.length} prompts)</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      <div className="flex items-start gap-2 rounded-2xl border border-border bg-muted/55 p-3 text-xs text-muted-foreground">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-foreground" />
        Select a category to auto-load a matching prompt and expected checks.
      </div>
    </div>
  );
}
