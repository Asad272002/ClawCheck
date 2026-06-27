# ClawCheck

ClawCheck is a workspace-first AI safety review platform that evaluates agent responses, explains what was missed, and tracks semantic improvement across iterations.

## Problem

Teams shipping AI agents struggle to:
- run consistent safety reviews
- compare improvements across versions
- understand what an agent actually covered versus what it only mentioned weakly
- preserve review memory across repeated evaluations

## Solution

ClawCheck combines:
- deterministic rubric scoring for stable approval decisions
- semantic expected-check coverage for deeper response analysis
- persisted report memory so insights stay attached to reports
- workspace-level semantic analytics so teams can track recurring issues over time

## One-Line Pitch

ClawCheck helps teams train and approve one AI agent per workspace by combining structured scoring with semantic review memory.

## Demo Flow

1. Sign in.
2. Open `/dashboard`.
3. Show the semantic workspace snapshot card.
4. Open `/workspaces`.
5. Show the workspace semantic overview section.
6. Open the demo workspace:
   `/workspaces/asad-s-workspace-d866`
7. Show the semantic analytics summary and repeated review points.
8. Open the latest semantic report:
   `/evaluations/report-d20e0c0f`
9. Show:
   - semantic coverage
   - semantic suggestions
   - similar reports
   - workspace memory
   - semantic metadata
10. Open `/reports`.
11. Show lightweight semantic indicators in the report list.

## Demo Workspace

- Workspace ID: `workspace-09d9d866`
- Workspace slug: `asad-s-workspace-d866`
- Latest demo report: `report-d20e0c0f`

## What To Show Live

- The dashboard is not just showing scores; it is showing persisted semantic review signals.
- Workspaces are centered around one agent and keep evaluation history together.
- Each semantic report shows what was covered, what was partially covered, and what was missed.
- Workspace analytics roll up repeated missed themes and next actions automatically.

## Key Features

- Rule-based safety scoring
- Semantic expected-check coverage
- Semantic suggestions from missed and partial checks
- Similar-report retrieval
- Workspace memory from prior linked reports
- Persisted workspace semantic analytics
- Safe fallback rendering for older non-semantic reports

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Supabase Auth + Postgres
- Supabase pgvector
- `@huggingface/transformers`
- Local ONNX embeddings: `onnx-community/all-MiniLM-L6-v2-ONNX`

## Semantic Architecture

1. A workspace-linked evaluation is submitted.
2. Deterministic scoring runs first.
3. Semantic coverage compares expected checks against response chunks.
4. Semantic suggestions are composed from missed and partial checks.
5. Similar reports and workspace memory are attached.
6. Semantic insights are persisted with the report.
7. Workspace semantic analytics are recalculated and saved.
8. Dashboard, reports, and workspaces read persisted analytics without recomputing in the UI.

## Screenshot Checklist

- Dashboard with semantic workspace snapshot
- Reports page with semantic indicators
- Report detail page with semantic coverage
- Report detail page with semantic suggestions
- Workspace detail page with semantic analytics summary
- Workspace list page with workspace semantic overview

## Backup Plan If Live Demo Fails

- Open the demo workspace directly: `/workspaces/asad-s-workspace-d866`
- Open the latest semantic report directly: `/evaluations/report-d20e0c0f`
- Open `/reports` to show semantic indicators
- Open `/dashboard` to show the persisted semantic snapshot

## Known Limitations

- Deterministic score and semantic review are intentionally separate today.
- Cross-workspace semantic recommendation orchestration is not implemented yet.
- Visual QA in this session was mostly server-side plus authenticated page verification; final human browser pass is still recommended before presenting.
- Semantic quality depends on current chunking and threshold tuning.

## Future Roadmap

- Cross-workspace recommendation prioritization
- Better benchmark libraries and golden responses
- Approval workflows and reviewer sign-off
- Trend alerts when a workspace repeats the same semantic failure
- Richer semantic comparison between versions
