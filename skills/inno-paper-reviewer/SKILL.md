---
id: inno-paper-reviewer
name: inno-paper-reviewer
version: 1.0.0
description: |-
  Use when reviewing MPAcc thesis topics, proposals, outlines, chapters, citations, revisions, or defense materials for standards compliance and logical risk.
stages: ["publication"]
tools: ["read_file", "search_project", "write_file"]
summary: |-
  MPAcc thesis review wrapper. Checks topic standards, evidence boundary, problem-cause-solution logic, method-data fit, citation integrity, and writing quality using mpacc-thesis-writer references.
primaryIntent: evaluation
intents: ["evaluation", "writing"]
capabilities: ["evaluation-benchmarking", "research-planning"]
domains: ["accounting", "mpacc", "management"]
keywords: ["mpacc", "会计专硕", "论文审查", "选题审查", "开题审查", "质量检查", "citation audit", "advisor feedback"]
source: local
status: verified
resourceFlags:
  hasReferences: true
  hasScripts: false
  hasTemplates: false
  hasAssets: false
  referenceCount: 2
  scriptCount: 0
  templateCount: 0
  assetCount: 0
  optionalScripts: false
---

# inno-paper-reviewer

This is the Oh-my--paper review entrypoint, specialized for MPAcc thesis work. Keep findings concrete and evidence-based. Findings lead; summary follows.

## Required Routing

For MPAcc review, read and follow:

- `../mpacc-thesis-writer/references/quality-checklist.md`

Load additional MPAcc references only as needed:

| Review target | Also read |
|---|---|
| topic or title | `../mpacc-thesis-writer/references/topic-selection-framework.md` |
| proposal/opening report | `../mpacc-thesis-writer/references/proposal-and-litreview-deliverables.md` |
| outline or chapter structure | `../mpacc-thesis-writer/references/thesis-structure-and-patterns.md`, `../mpacc-thesis-writer/references/chapter-writing-rules.md` |
| recommendations | `../mpacc-thesis-writer/references/problem-cause-solution-logic.md` |
| methods/tools | `../mpacc-thesis-writer/references/method-data-fit-guide.md` |
| case evidence | `../mpacc-thesis-writer/references/case-material-intake.md`, `../mpacc-thesis-writer/references/case-analysis-framework.md` |
| citations | `../mpacc-thesis-writer/scripts/check_citations.py` |

Do not apply generic biomedical, IEEE/ACM, or peer-review reporting standards to MPAcc thesis work unless the user explicitly asks for them.

## Review Priorities

Order findings by severity:

1. Hard topic-gate failure: no visible real problem, invented concept, data-direction conflict, causal identity, missing accounting line, or unverifiable core claim.
2. Evidence failure: unsupported case facts, missing source/page/date, public inference written as fact, or invented citation.
3. Logic failure: research question unclear, no provisional answer, recommendation not tied to problem/cause, or working-report style sprawl.
4. Method failure: method chosen for fashion, AHP weights without source, ML/text/fsQCA without required data, or KRI falsely described as prediction.
5. Structure/style failure: chapter functions duplicate, theory is decorative, prose is generic, or conclusion does not answer the research question.

## Output Format

Use:

```markdown
## Findings

1. [Severity] [Location] Issue.
   Evidence:
   Fix:

## Open Questions

## Brief Summary
```

If no major issue is found, say so clearly and list remaining test gaps or residual risks.
