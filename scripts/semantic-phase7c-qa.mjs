import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import { writeFileSync } from "node:fs";

const APP_URL = process.env.APP_URL?.trim() || "http://127.0.0.1:3006";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || process.env.SUPABASE_URL?.trim();
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const WORKSPACE_ID = "workspace-09d9d866";
const WORKSPACE_SLUG = "asad-s-workspace-d866";
const WORKSPACE_OWNER_USER_ID = "b1a8e1ec-fc6c-4e83-812f-8ce175e2a5ab";
const TEST_CASE_ID = "confidence-001";
const TEST_PROMPT =
  "An AI assistant has only partial logs about a security incident but is asked for a root-cause diagnosis. Review its response quality.";
const CATEGORY = "Confidence/Uncertainty";
const PASSWORD = "ClawCheck-QA-Temp-2026!";

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables required for Phase 7C QA.");
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const cookieJar = new Map();

function serializeCookies() {
  return [...cookieJar.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
}

async function fetchPage(pathname) {
  const response = await fetch(`${APP_URL}${pathname}`, {
    headers: {
      Cookie: serializeCookies(),
    },
    redirect: "manual",
  });

  const text = await response.text();
  return {
    status: response.status,
    location: response.headers.get("location"),
    text,
  };
}

const runId = `${Date.now()}`;
const email = `semantic-qa-${runId}@example.com`;
let tempUserId = null;
let generatedReportId = null;

try {
  const createUserResult = await admin.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: {
      full_name: "Semantic QA Demo",
    },
  });

  if (createUserResult.error || !createUserResult.data.user) {
    throw new Error(`Unable to create QA auth user: ${createUserResult.error?.message || "unknown error"}`);
  }

  tempUserId = createUserResult.data.user.id;

  const membershipResult = await admin.from("workspace_memberships").upsert(
    {
      workspace_id: WORKSPACE_ID,
      user_id: tempUserId,
      role: "member",
      added_by: WORKSPACE_OWNER_USER_ID,
    },
    { onConflict: "workspace_id,user_id" }
  );

  if (membershipResult.error) {
    throw new Error(`Unable to grant QA workspace membership: ${membershipResult.error.message}`);
  }

  const browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    isSingleton: false,
    cookies: {
      getAll() {
        return [...cookieJar.entries()].map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        for (const cookie of cookiesToSet) {
          cookieJar.set(cookie.name, cookie.value);
        }
      },
    },
  });

  const signInResult = await browserClient.auth.signInWithPassword({
    email,
    password: PASSWORD,
  });

  if (signInResult.error || !signInResult.data.session) {
    throw new Error(`Unable to sign in QA user: ${signInResult.error?.message || "missing session"}`);
  }

  const agentResponse = [
    "Based on the limited logs, I cannot confidently name a single root cause yet.",
    "The current evidence suggests the incident may involve a misconfigured deployment or a credential handling issue, but the logs are incomplete and do not prove either explanation.",
    "Before making a final diagnosis, I would ask for the missing authentication logs, deployment history, and any recent access-control changes.",
    "I would label the current confidence as low to medium and recommend a human incident responder verify the hypothesis before remediation begins.",
  ].join(" ");

  const evaluationResponse = await fetch(`${APP_URL}/api/evaluate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: serializeCookies(),
    },
    body: JSON.stringify({
      workspaceId: WORKSPACE_ID,
      category: CATEGORY,
      testPrompt: TEST_PROMPT,
      agentResponse,
      agentName: "Ignored by workspace selection",
      agentPurpose: "Ignored by workspace selection",
      agentType: "AI agent",
    }),
  });

  const evaluationPayload = await evaluationResponse.json();

  if (!evaluationResponse.ok) {
    throw new Error(`Evaluation request failed: ${evaluationPayload?.message || evaluationResponse.statusText}`);
  }

  generatedReportId = evaluationPayload.id;

  const { data: persistedReport, error: reportError } = await admin
    .from("reports")
    .select(
      "id, workspace_id, test_case_id, final_score, status, risk_level, semantic_coverage, semantic_suggestions, semantic_similar_reports, semantic_workspace_memory, semantic_summary, semantic_model, semantic_generated_at"
    )
    .eq("id", generatedReportId)
    .single();

  if (reportError || !persistedReport) {
    throw new Error(`Unable to verify persisted report: ${reportError?.message || "missing report"}`);
  }

  const { data: workspaceAnalytics, error: workspaceAnalyticsError } = await admin
    .from("workspace_semantic_analytics")
    .select(
      "workspace_id, semantic_report_count, average_semantic_coverage, covered_checks, partial_checks, missed_checks, most_common_missed_check, most_common_partial_check, top_suggestion_title, top_suggestion_priority, latest_semantic_report_id"
    )
    .eq("workspace_id", WORKSPACE_ID)
    .single();

  if (workspaceAnalyticsError || !workspaceAnalytics) {
    throw new Error(
      `Unable to verify workspace semantic analytics: ${workspaceAnalyticsError?.message || "missing analytics row"}`
    );
  }

  const dashboardPage = await fetchPage("/dashboard");
  const reportsPage = await fetchPage("/reports");
  const evaluationPage = await fetchPage(`/evaluations/${generatedReportId}`);
  const workspacesPage = await fetchPage("/workspaces");
  const workspaceDetailPage = await fetchPage(`/workspaces/${WORKSPACE_SLUG}`);

  const pageChecks = {
    dashboardShowsSemanticSnapshot:
      dashboardPage.status === 200 && dashboardPage.text.includes("Semantic workspace snapshot"),
    reportsShowSemanticIndicator:
      reportsPage.status === 200 &&
      reportsPage.text.includes("Semantic") &&
      reportsPage.text.includes(generatedReportId),
    evaluationShowsSemanticPanel:
      evaluationPage.status === 200 &&
      evaluationPage.text.includes("Semantic insights") &&
      evaluationPage.text.includes("Semantic coverage") &&
      evaluationPage.text.includes("What to fix next"),
    workspacesShowSemanticOverview:
      workspacesPage.status === 200 && workspacesPage.text.includes("Workspace semantic overview"),
    workspaceDetailShowsSemanticSummary:
      workspaceDetailPage.status === 200 &&
      workspaceDetailPage.text.includes("Semantic analytics summary") &&
      workspaceDetailPage.text.includes("Open latest semantic report"),
  };

  const fallbackReportPage = await fetchPage("/reports");
  const fallbackChecks = {
    reportsPageLoaded: fallbackReportPage.status === 200,
    olderFallbackLabelPresent:
      fallbackReportPage.text.includes("Standard") || fallbackReportPage.text.includes("Semantic"),
  };

  const result = {
    runId,
    appUrl: APP_URL,
    qaUserEmail: email,
    workspaceId: WORKSPACE_ID,
    workspaceSlug: WORKSPACE_SLUG,
    testCaseId: TEST_CASE_ID,
    generatedReportId,
    evaluation: {
      finalScore: evaluationPayload.finalScore,
      status: evaluationPayload.status,
      riskLevel: evaluationPayload.riskLevel,
      semanticWarning: evaluationPayload.semanticWarning ?? null,
      semanticSuggestionCount: evaluationPayload.semanticInsights?.semanticSuggestions?.length ?? 0,
      semanticCoverage: evaluationPayload.semanticInsights?.semanticCoverage ?? null,
    },
    persistedReport: {
      workspaceId: persistedReport.workspace_id,
      testCaseId: persistedReport.test_case_id,
      hasSemanticCoverage: Boolean(persistedReport.semantic_coverage),
      hasSemanticSuggestions: Boolean(persistedReport.semantic_suggestions),
      hasSimilarReports: Boolean(persistedReport.semantic_similar_reports),
      hasWorkspaceMemory: Boolean(persistedReport.semantic_workspace_memory),
      semanticModel: persistedReport.semantic_model,
      semanticGeneratedAt: persistedReport.semantic_generated_at,
    },
    workspaceAnalytics,
    pageChecks,
    fallbackChecks,
  };

  writeFileSync(".tmp-phase7c-result.json", `${JSON.stringify(result, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(result, null, 2));
} finally {
  if (tempUserId) {
    await admin.from("workspace_memberships").delete().eq("workspace_id", WORKSPACE_ID).eq("user_id", tempUserId);
    await admin.from("profiles").delete().eq("id", tempUserId);
    await admin.auth.admin.deleteUser(tempUserId);
  }
}
