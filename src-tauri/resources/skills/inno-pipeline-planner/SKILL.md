---
id: inno-pipeline-planner
name: inno-pipeline-planner
version: 1.0.0
description: |-
  Use when creating or updating Oh-my--paper pipeline files for an MPAcc thesis project under research-pipeline-planner control.
stages: ["ideation"]
tools: ["read_file", "search_project", "write_file"]
summary: |-
  Generates `.pipeline/docs/research_brief.json` and `.pipeline/tasks/tasks.json` for MPAcc thesis projects, using research-pipeline-planner as controller and mpacc-thesis-writer as the domain standard.
primaryIntent: research
intents: ["research", "writing"]
capabilities: ["research-planning", "agent-workflow"]
domains: ["accounting", "mpacc"]
keywords: ["mpacc", "会计专硕", "pipeline", "research brief", "tasks", "论文流程", "选题", "开题"]
source: local
status: verified
resourceFlags:
  hasReferences: true
  hasScripts: false
  hasTemplates: false
  hasAssets: false
  referenceCount: 4
  scriptCount: 0
  templateCount: 0
  assetCount: 0
  optionalScripts: false
---

# inno-pipeline-planner

This skill is a file-generation helper. Keep `research-pipeline-planner` as the controller. Use this skill only to materialize or revise `.pipeline` JSON files after the controller has determined the MPAcc project stage and next action.

## Required References

Read:

- `../mpacc-thesis-writer/SKILL.md`
- `references/pipeline-contract.md`

Then load `generation-rules.md`, `brief-schema.md`, or `tasks-schema.md` only when writing the corresponding files.

## MPAcc Pipeline Rules

- Interpret survey, ideation, experiment, publication, and promotion according to `research-pipeline-planner`.
- Do not generate tasks that skip the MPAcc topic gate.
- Recommended skills for topic, evidence, writing, review, and defense tasks must include `mpacc-thesis-writer`.
- Do not invent papers, company data, citations, interview materials, method results, or advisor decisions.
- Ask concise follow-up questions only when required fields are missing.
- Keep all outputs inside the active project workspace.

## Required Brief Fields

When possible, ensure `.pipeline/docs/research_brief.json` captures:

- thesis title or working direction;
- real professional problem;
- research question;
- provisional answer/main claim;
- official thesis form;
- analytical pattern;
- case design;
- evidence boundary;
- current stage;
- missing materials.

## Task Generation Guidance

Generate tasks that map to MPAcc work:

- survey: collect school requirements, case evidence, public documents, literature, and material gaps;
- ideation: converge topic, case design, research question, and provisional answer;
- experiment: build evidence matrix, method-data fit, tool design, calculation, or case comparison;
- publication: draft opening report, literature review, outline, chapters, citations, and revisions;
- promotion: defense slides, defense Q&A, and final handoff.

Each `nextActionPrompt` should name the relevant MPAcc gate or reference file, not a generic academic-paper instruction.
