---
id: inno-paper-writing
name: inno-paper-writing
version: 1.0.0
description: |-
  Use when drafting, structuring, or revising MPAcc (会计专硕) thesis deliverables, including proposal, literature review, outline, chapters, and final manuscript text.
stages: ["publication"]
tools: ["read_file", "search_project", "write_file"]
summary: |-
  MPAcc thesis writing wrapper for Oh-my--paper. Routes thesis writing work to mpacc-thesis-writer while preserving Oh-my--paper publication-stage commands.
primaryIntent: writing
intents: ["writing", "research", "evaluation"]
capabilities: ["visualization-reporting", "research-planning"]
domains: ["accounting", "mpacc", "management"]
keywords: ["mpacc", "会计专硕", "毕业论文", "开题报告", "文献综述", "案例分析", "论文正文", "chapter drafting"]
source: local
status: verified
resourceFlags:
  hasReferences: true
  hasScripts: false
  hasTemplates: false
  hasAssets: false
  referenceCount: 3
  scriptCount: 0
  templateCount: 0
  assetCount: 0
  optionalScripts: false
---

# inno-paper-writing

This is the Oh-my--paper publication-stage writing entrypoint, specialized for MPAcc thesis work. Keep this skill as a compatibility wrapper for existing Oh-my--paper commands; use `mpacc-thesis-writer` for the actual MPAcc standards, templates, scripts, and quality gates.

## Required Routing

For MPAcc tasks, read and follow:

- `../mpacc-thesis-writer/SKILL.md`

Then load only the relevant MPAcc reference files:

| User need | MPAcc reference |
|---|---|
| topic/proposal gate | `references/topic-selection-framework.md`, `references/proposal-and-litreview-deliverables.md` |
| outline | `references/thesis-structure-and-patterns.md`, `references/chapter-writing-rules.md` |
| chapter drafting | `references/chapter-writing-rules.md`, plus method/theory/case references as needed |
| literature review | `references/literature-review-method.md`, `references/runtime-literature-selection.md` |
| citation plan or audit | `references/runtime-literature-selection.md`, `scripts/check_citations.py` |
| revision | `references/problem-cause-solution-logic.md`, `references/quality-checklist.md` |

Do not use the old IEEE/ACM references in this skill for MPAcc thesis work unless the user explicitly asks for a generic conference-style research paper.

## Writing Discipline

- Require real topic, school requirements, case materials, and runtime literature before drafting final text.
- Mark missing facts with `〔待补：...〕`; do not invent enterprise data, interviews, policy documents, or citations.
- Keep the local MPAcc topic standards ahead of excellent-thesis title patterns.
- Confirm the official thesis form, analytical pattern, case design, evidence boundary, and provisional answer before drafting full chapters.
- Use full academic prose in deliverables, but keep planning tables and matrices structured.
- Every recommendation must map to evidence, a diagnosed problem, and a cause/mechanism.

## Expected Outputs

Depending on the request, produce:

- opening report;
- literature review;
- thesis outline;
- chapter draft;
- citation matrix/plan;
- revision plan;
- final quality-check report.

Save generated artifacts in the active project workspace, not inside the skill directory.
