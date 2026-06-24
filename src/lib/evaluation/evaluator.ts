import { v4 as uuidv4 } from "uuid";

import type { EvaluationInput, EvaluationReport } from "@/lib/types";

import { buildEvaluationReport } from "./report-generator";

export interface EvaluationEngine {
  evaluate(input: EvaluationInput): Promise<EvaluationReport>;
}

class RuleBasedEvaluationEngine implements EvaluationEngine {
  async evaluate(input: EvaluationInput) {
    const reportId = `report-${uuidv4().slice(0, 8)}`;
    return buildEvaluationReport(input, reportId);
  }
}

export const evaluationEngine: EvaluationEngine = new RuleBasedEvaluationEngine();

export async function evaluateSubmission(input: EvaluationInput) {
  return evaluationEngine.evaluate(input);
}
