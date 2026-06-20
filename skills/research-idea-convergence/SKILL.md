---
id: research-idea-convergence
name: Research Idea Convergence
version: 1.0.0
description: |-
  Use when an MPAcc thesis project needs topic selection, topic narrowing, candidate case comparison, or research-question convergence.
stages: ["ideation"]
tools: ["read_file", "search_project", "write_file"]
summary: |-
  Interactive MPAcc topic convergence. Generates 2-4 candidate topics or refinements using local topic standards, presents trade-offs, and waits for user selection before writing the final topic angle.
primaryIntent: ideation
intents: ["ideation", "research", "evaluation"]
capabilities: ["research-planning"]
domains: ["accounting", "mpacc"]
keywords: ["mpacc", "会计专硕", "选题", "研究问题", "案例设计", "topic selection", "research question", "idea convergence"]
source: local
status: verified
resourceFlags:
  hasReferences: false
  hasScripts: false
  hasTemplates: true
  hasAssets: false
  referenceCount: 0
  scriptCount: 0
  templateCount: 1
  assetCount: 0
  optionalScripts: false
---

# Research Idea Convergence

Use this skill to converge MPAcc thesis topics. The output is not a fashionable title; it is a defensible research problem with evidence boundary, case design, and provisional answer.

## Required Reference

Before generating candidates, read:

- `../mpacc-thesis-writer/references/topic-selection-framework.md`

If the active workspace contains a local `选题标准/` directory, use it as the controlling standard when it conflicts with generic academic-paper habits.

## Working Rules

1. Generate 2-4 candidate topics or topic refinements, no more and no fewer.
2. Each candidate must pass the MPAcc hard gates or be explicitly marked as high risk.
3. Do not start from method labels, hot words, available samples, or excellent-thesis title patterns.
4. Do not invent company data, citations, internal documents, interviews, or regulatory facts.
5. Always stop at the user checkpoint before finalizing. Do not auto-select the topic.

## Candidate Format

For each candidate, provide:

- title draft;
- reality observation;
- research question: `observable phenomenon + one or two key associated factors + consequence`;
- provisional answer/main claim;
- official thesis form;
- analytical pattern;
- case design;
- accounting/professional line;
- public/case evidence that can directly verify the problem;
- unavailable internal data or inference limits;
- hard-gate verdict: pass / revise / reject;
- main risk and repair move.

## Comparison Table

After all candidates, compare:

| Dimension | Candidate 1 | Candidate 2 | Candidate 3 | Candidate 4 |
|---|---|---|---|---|
| Real problem visibility |  |  |  |  |
| Accounting relevance |  |  |  |  |
| Evidence availability |  |  |  |  |
| Causal depth beyond identities |  |  |  |  |
| Case design fit |  |  |  |  |
| Tool/solution feasibility |  |  |  |  |
| Collapse risk |  |  |  |  |

## User Checkpoint

Stop and ask the user to choose, combine, or reject candidates. After confirmation, write the selected direction to `.viewerleaf/research/Ideation/publishable_angle.md` or the project-equivalent topic file.

The final topic file must record:

- selected title;
- real problem and research question;
- provisional answer/main claim;
- evidence boundary;
- case design;
- selection record and discarded alternatives.
