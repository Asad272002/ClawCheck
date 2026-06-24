# ClawCheck

ClawCheck is a production-ready Next.js starter for evaluating AI agent safety and reliability across structured red-team categories such as privacy, bias, hallucination, misuse, confidence handling, human oversight, stakeholder harm, and recommendation quality.

## Features

- Dark-first premium dashboard UI for AI safety workflows
- Landing page, dashboard, evaluation flow, test case library, and detailed report views
- Mock evaluation engine with rubric and keyword-based scoring
- Typed mock data for test cases, scoring rubric, and sample reports
- Zod-validated form flow with React Hook Form
- Recharts visualizations for risk and score reporting
- Sonner toasts, next-themes support, Tailwind CSS, and shadcn/ui components
- Clean modular structure designed for future LLM and retrieval integrations

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- Lucide React
- Recharts
- next-themes
- Sonner
- pnpm

## Folder Structure

```text
src/
  app/
    (marketing)/
    (dashboard)/
    api/
  components/
    evaluation/
    layout/
    marketing/
    reports/
    shared/
    ui/
  config/
  data/
  hooks/
  lib/
    evaluation/
    schemas/
    types/
  styles/
public/
  assets/
docs/
```

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## How ClawCheck Works

1. Select a test category from the prompt library.
2. Run the prompt against a target AI agent.
3. Paste the target response into ClawCheck.
4. Submit the form to the mock evaluation API.
5. Review the generated report with scores, strengths, weaknesses, and recommendations.

## Hackathon Context

ClawCheck is designed as a fast-moving hackathon-ready foundation: it focuses on a polished evaluation workflow, typed mock backend logic, and extensibility rather than authentication or database complexity in version one.

## Future Roadmap

- LLM-based evaluator
- ChromaDB-powered test retrieval
- API-based agent testing
- Export reports as PDF
- OmegaClaw integration
- Benchmark leaderboard