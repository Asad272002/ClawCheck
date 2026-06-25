"use client";

import { AlertTriangle } from "lucide-react";
import type { Control, FieldPath } from "react-hook-form";
import { Controller } from "react-hook-form";

import type { EvaluationSchema } from "@/lib/schemas/evaluation.schema";
import type { EvaluationCategory, TestCase } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TestCategorySelectorProps = {
  control: Control<EvaluationSchema>;
  groupedTestCases: Record<EvaluationCategory, TestCase[]>;
  name: FieldPath<EvaluationSchema>;
  onCategoryChange?: (category: EvaluationCategory) => void;
};

export function TestCategorySelector({ control, groupedTestCases, name, onCategoryChange }: TestCategorySelectorProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="category">Test category</Label>
        <p className="text-xs text-muted-foreground">
          Choose the risk area you want to evaluate, then pick the exact prompt template for that category.
        </p>
      </div>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            value={field.value}
            onValueChange={(value) => {
              field.onChange(value);
              onCategoryChange?.(value as EvaluationCategory);
            }}
          >
            <SelectTrigger id="category" className="w-full rounded-xl border-border bg-background/80 px-4 py-6">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border bg-popover">
              {Object.entries(groupedTestCases).map(([category, cases]) => (
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
        After selecting a category, you can choose from the available prompt templates and edit the final prompt if needed.
      </div>
    </div>
  );
}
