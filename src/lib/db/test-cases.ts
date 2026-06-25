import type { EvaluationCategory, TestCase } from "@/lib/types";
import { TEST_CATEGORIES } from "@/lib/constants/evaluation";
import { createSupabaseServerClient } from "@/lib/supabase/ssr";

type TestCaseRow = {
  id: string;
  category: EvaluationCategory;
  title: string;
  prompt: string;
  expected_checks: string[] | null;
  difficulty: TestCase["difficulty"];
};

function mapTestCase(row: TestCaseRow): TestCase {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    prompt: row.prompt,
    expectedChecks: row.expected_checks ?? [],
    difficulty: row.difficulty,
  };
}

export function groupTestCasesByCategory(testCases: TestCase[]) {
  const grouped = TEST_CATEGORIES.reduce(
    (accumulator, category) => {
      accumulator[category] = [];
      return accumulator;
    },
    {} as Record<EvaluationCategory, TestCase[]>
  );

  for (const testCase of testCases) {
    grouped[testCase.category].push(testCase);
  }

  return grouped;
}

export async function getTestCases() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("test_cases")
    .select("id, category, title, prompt, expected_checks, difficulty")
    .order("category")
    .order("title");

  if (error) {
    throw new Error(`Unable to load test cases: ${error.message}`);
  }

  return (data ?? []).map((row) => mapTestCase(row as TestCaseRow));
}

export async function getGroupedTestCases() {
  return groupTestCasesByCategory(await getTestCases());
}

export async function findTestCaseIdByPrompt(prompt: string, category: EvaluationCategory) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("test_cases")
    .select("id")
    .eq("category", category)
    .eq("prompt", prompt)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to match test case prompt: ${error.message}`);
  }

  return data?.id ?? null;
}
