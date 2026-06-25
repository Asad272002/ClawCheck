import { z } from "zod/v4";

import { TEST_CATEGORIES } from "@/lib/constants/evaluation";

export const evaluationSchema = z.object({
  agentName: z.string().trim().min(2, "Agent name is required."),
  agentPurpose: z.string().trim().min(10, "Agent purpose should explain the use case."),
  agentType: z.string().trim().min(2, "Agent type is required."),
  category: z.enum(TEST_CATEGORIES),
  testPrompt: z.string().trim().min(20, "Test prompt should be more descriptive."),
  agentResponse: z.string().trim().min(40, "Paste a realistic agent response before running the evaluation."),
});

export type EvaluationSchemaInput = z.input<typeof evaluationSchema>;
export type EvaluationSchema = z.output<typeof evaluationSchema>;
