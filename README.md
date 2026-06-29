# ClawCheck

ClawCheck is a full-stack AI safety evaluation platform for testing agent responses, generating structured review reports, and tracking improvement over time at the workspace level.

It combines a deterministic scoring pipeline with a local semantic analysis layer so teams can review not only whether an answer "sounds right," but whether it actually covers the safety expectations, caveats, and operational checks required for trustworthy agent behavior.

## What ClawCheck Does

ClawCheck is built around a practical evaluation loop:

1. A reviewer selects or links a test case.
2. An AI agent produces a response to that prompt.
3. The response is submitted to ClawCheck.
4. ClawCheck scores the response with deterministic rubric logic.
5. ClawCheck runs semantic coverage analysis against expected checks.
6. A detailed report is generated and stored.
7. The result is surfaced in report views, workspace history, and dashboard analytics.

This makes ClawCheck useful both as:

- A review tool for one-off agent evaluations
- A workspace-based improvement system for a single tracked agent over time
- A foundation for future sandbox-style evaluation before higher-risk agent actions are approved

## Core Product Areas

### 1. Deterministic Evaluation

ClawCheck uses an explicit, explainable scoring path for the primary evaluation result. This keeps the final score stable and reviewable instead of hiding it behind a purely generative system.

Deterministic evaluation covers:

- Category-based review logic
- Risk scoring
- Status classification
- Strength and weakness generation
- Recommendation generation
- Human-readable report summaries

This deterministic score remains the baseline system of record.

### 2. Semantic Coverage Analysis

ClawCheck adds a semantic layer on top of the deterministic evaluator.

Instead of looking only for exact keyword overlap, the app compares the agent response against normalized expected checks and detects whether the response semantically:

- Covers the point clearly
- Mentions it only partially
- Misses it entirely

This enables better follow-up suggestions, repeated weakness detection, similar report retrieval, and workspace-level semantic analytics.

### 3. Workspace-Centered Improvement

Each workspace is designed around a single agent being improved over time.

ClawCheck tracks:

- Linked evaluation reports
- Repeated weaknesses
- Score movement across iterations
- Semantic coverage trends
- Top follow-up recommendations
- Workspace-level semantic analytics and summaries

This turns evaluation from a one-time report into an iterative agent-improvement workflow.

### 4. Future Safety Sandbox Direction

The current product evaluates completed responses. The longer-term direction is to let ClawCheck act as a validation layer around autonomous or semi-autonomous agents by checking proposed responses or actions before they are finalized.

That future mode is not fully implemented as an automated gate today, but the platform already contains the foundations needed for it:

- Structured expected checks
- Report history
- Semantic retrieval
- Organization-specific evaluation context
- Workspace analytics

## Semantic Search and Embeddings

ClawCheck includes a local semantic search pipeline backed by vector embeddings and retrieval in Supabase Postgres with `pgvector`.

### Why Semantic Search Exists

Traditional rubric scoring is useful, but it has limits:

- An agent can use different wording while still covering the right idea
- A response can look polished while quietly missing an important review point
- Repeated weaknesses are hard to identify reliably with tags alone
- Similar prior reports are more useful when they are found by meaning, not only category labels

The semantic layer addresses those gaps.

### Current Embedding Approach

ClawCheck uses a local, server-side embedding pipeline with:

- Provider: `local-transformers`
- Model: `onnx-community/all-MiniLM-L6-v2-ONNX`
- Dimension: `384`
- Library: `@huggingface/transformers`

This approach was chosen because it is:

- Free to run locally
- Reproducible
- Suitable for hackathon and prototype environments
- Independent from paid embedding APIs

### What Gets Embedded

The current semantic pipeline can generate and persist embeddings for:

- Normalized expected checks
- Test case prompts
- Report agent responses
- Report summaries

### What Semantic Retrieval Supports

The current backend supports retrieval helpers for:

- Expected-check similarity
- Similar report search
- Workspace-scoped similar report history
- Similar test case search

### What Semantic Coverage Classifies

The semantic coverage classifier chunks the response and compares the best-matching chunk to each expected check. Each expected check is then classified as:

- `covered`
- `partial`
- `missed`

That result is used to build:

- Coverage summaries
- Semantic suggestions
- Similar report comparisons
- Workspace memory hints
- Persisted semantic analytics

### Important Design Principle

The semantic layer currently supports the review process. It does not override the deterministic final score.

That means:

- The deterministic score remains the baseline evaluation result
- Semantic insights add meaning-aware feedback
- The system stays explainable while still becoming more context-aware

## Organization Knowledge and Retrieval

ClawCheck is designed to support retrieval-based evaluation against real organizational context.

The platform can embed and retrieve organization-specific material such as:

- Internal AI policies
- Privacy requirements
- Security checklists
- Compliance documents
- Safety review forms
- Tone or customer-support guidelines
- Strong benchmark answers
- Weak benchmark answers
- Previous ClawCheck reports

This is retrieval, not model training.

ClawCheck does not train a new model on organization data. Instead, it stores embeddings for relevant documents and retrieves them during evaluation so responses can be judged against the team's actual operating context.

## Product Features

- Public marketing pages and authenticated product dashboard
- Workspace-based agent evaluation and tracking
- Test case library with expected checks
- Deterministic evaluation and report generation
- Persisted semantic coverage and suggestion payloads
- Similar report and workspace memory retrieval
- Workspace semantic analytics
- Semantic report indicators in list and detail views
- Local embedding generation and protected reindex workflows
- Supabase-backed auth, storage, and structured data persistence

## Technical Architecture

### Frontend

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Recharts
- Lucide React
- Sonner

### Backend and Data

- Next.js route handlers
- Supabase Auth
- Supabase Postgres
- Supabase `pgvector`
- Row-level security policies
- Server-side report persistence

### Semantic Layer

- `@huggingface/transformers`
- Local ONNX embedding model
- Vector similarity search
- Chunk-based semantic coverage classification
- Deterministic semantic suggestion composition

## Project Structure

```text
src/
  app/
    (marketing)/            Public landing and roadmap pages
    (dashboard)/            Authenticated product application
    api/                    Evaluation, semantic admin, and data routes
  components/
    evaluation/             Report detail UI, semantic panels, evaluation views
    flow/                   Public roadmap/flow content
    layout/                 Shared shells, sidebar, headers
    marketing/              Public-facing homepage sections
    reports/                Report cards, indicators, summary views
    workspaces/             Workspace cards, members, analytics, trend views
    shared/                 Shared presentation and utility components
    ui/                     Base design system components
  config/                   App-level static configuration
  data/                     Seed-style static content and presentation data
  hooks/                    Client hooks, including evaluation flow helpers
  lib/
    auth/                   User/session and profile helpers
    db/                     Supabase-backed data loading and persistence
    evaluation/             Deterministic evaluator and report generator
    schemas/                Zod validation schemas
    semantic/               Embeddings, retrieval, coverage, suggestions, analytics
    supabase/               Browser/server/admin Supabase clients
    types/                  Shared TypeScript domain types
supabase/
  migrations/               Database schema and semantic feature migrations
docs/                       Product and taxonomy reference documents
public/                     Static assets
```

## Database and Semantic Schema

The Supabase migrations in [`supabase/migrations`](./supabase/migrations) define the core application schema and the semantic-search additions.

Important schema areas include:

- `workspaces`
- `workspace_versions`
- `reports`
- `test_cases`
- `test_case_expected_checks`
- `workspace_semantic_analytics`

Semantic-related migrations include:

- Semantic search foundation
- Vector-dimension migration to local embeddings
- Semantic retrieval SQL functions
- Report semantic persistence
- Workspace semantic analytics

## Evaluation Flow

The primary evaluation entrypoint is `POST /api/evaluate`.

At a high level, the server flow is:

1. Validate the incoming evaluation payload
2. Resolve workspace-linked agent details when needed
3. Run deterministic evaluation
4. Attempt to map the prompt to a stored test case
5. Generate semantic insights when a test case is available
6. Persist the report
7. Persist semantic insights with the report when available
8. Update workspace semantic analytics for linked workspace reports
9. Return the evaluation result to the caller

Semantic failures are intentionally fail-safe:

- If semantic composition fails, the base evaluation still succeeds
- If semantic persistence fails, the base report still remains the priority

## Semantic Reindex and Admin Routes

ClawCheck includes protected admin routes for semantic maintenance and preview workflows:

- `POST /api/admin/semantic-reindex`
- `POST /api/admin/semantic-coverage-preview`
- `POST /api/admin/semantic-suggestions-preview`
- `POST /api/admin/workspace-semantic-analytics/rebuild`

These routes are server-side only and protected with a manual token:

- `SEMANTIC_REINDEX_TOKEN`

## Environment Variables

The repository does not currently include a committed `.env.example`, so configure environment variables from the actual runtime expectations in the codebase.

### Required Supabase Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Required or Recommended Semantic Variables

- `SEMANTIC_REINDEX_TOKEN`
- `EMBEDDING_PROVIDER=local-transformers`
- `EMBEDDING_MODEL=onnx-community/all-MiniLM-L6-v2-ONNX`
- `EMBEDDING_DIMENSIONS=384`

### Optional Embedding Runtime Variables

- `EMBEDDING_CACHE_DIR`
- `EMBEDDING_DEVICE`
- `EMBEDDING_DTYPE`
- `EMBEDDING_LOCAL_FILES_ONLY`

Do not commit real credentials or tokens.

## Local Development

### Install Dependencies

If you want to follow the lockfile used in most local development sessions:

```bash
npm install
```

If you prefer pnpm and your lockfile is in sync:

```bash
pnpm install
```

### Start the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Quality Checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Supabase Setup

This project expects an existing Supabase project with the migrations applied.

Typical setup steps:

1. Create or connect a Supabase project
2. Apply the SQL migrations from `supabase/migrations`
3. Configure local environment variables
4. Seed or connect your application data
5. Run the app locally

If you are using the semantic layer, make sure:

- Vector-related migrations are applied
- Semantic persistence columns exist on `reports`
- Expected checks are normalized in `test_case_expected_checks`
- Reindex routes are properly configured before running semantic backfills

## Current State of the Product

ClawCheck is no longer just a starter template. It now includes:

- Real Supabase-backed data loading and persistence
- Authenticated dashboard and workspace experience
- Persisted evaluation reports
- Local semantic embeddings
- Vector retrieval helpers
- Semantic insight persistence
- Workspace semantic analytics
- A public `/flow` page that explains the product direction and roadmap

## Roadmap

The current implementation is strongest in evaluation, persistence, semantic review, and workspace-level insight. Likely next steps include:

- Deeper response-improvement flows
- Stronger organization-context retrieval
- More benchmark and regression tooling
- Export and presentation tooling
- Tighter integration with external agent systems such as OmegaClaw
- Future safety-gate workflows for higher-risk actions

## Reference Docs

See the [`docs`](./docs) folder for additional material:

- [`ClawCheck_Evaluation_Framework.md`](./docs/ClawCheck_Evaluation_Framework.md)
- [`Red_Team_Taxonomy.md`](./docs/Red_Team_Taxonomy.md)
- [`Sample_Evaluation_Report.md`](./docs/Sample_Evaluation_Report.md)

## License

Add your preferred license here if this project is being distributed beyond internal or hackathon use.
