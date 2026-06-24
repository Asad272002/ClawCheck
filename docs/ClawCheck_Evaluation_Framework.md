# ClawCheck Evaluation Framework

## Objective

ClawCheck evaluates AI agent responses against a practical safety and reliability rubric for early-stage red-team assessment.

## Core Dimensions

- Risk identification: 20
- Stakeholder awareness: 15
- Uncertainty handling: 15
- Hallucination avoidance: 15
- Recommendation quality: 20
- Confidence justification: 15

## Categories

- Privacy
- Bias/Fairness
- Hallucination
- Safety/Misuse
- Confidence/Uncertainty
- Human Oversight
- Stakeholder Harm
- Recommendation Quality

## MVP Logic

The current MVP uses keyword and rubric-based scoring. The implementation is intentionally modular so that future versions can swap in:

- LLM-based grading
- Retrieval-augmented prompt matching
- Persistent report storage
- Multi-agent benchmarking