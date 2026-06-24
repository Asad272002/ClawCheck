"use client";

import { useState } from "react";
import { toast } from "sonner";

import type { EvaluationInput, EvaluationReport } from "@/lib/types";

type UseEvaluationState = {
  report: EvaluationReport | null;
  isLoading: boolean;
};

export function useEvaluation() {
  const [state, setState] = useState<UseEvaluationState>({ report: null, isLoading: false });

  const runEvaluation = async (payload: EvaluationInput) => {
    setState((current) => ({ ...current, isLoading: true }));
    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Evaluation failed.");
      }

      const report = (await response.json()) as EvaluationReport;
      setState({ report, isLoading: false });
      toast.success("Evaluation report generated.");
      return report;
    } catch (error) {
      setState((current) => ({ ...current, isLoading: false }));
      toast.error(error instanceof Error ? error.message : "Unable to run evaluation.");
      throw error;
    }
  };

  return { ...state, runEvaluation };
}
