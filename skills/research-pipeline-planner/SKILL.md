---
id: research-pipeline-planner
name: Research Pipeline Planner
version: 1.0.0
stages: ["survey", "ideation", "experiment", "publication", "promotion"]
tools: ["read_file", "write_file", "update_pipeline"]
description: |-
  Use when defining or revising the project-level research pipeline for an MPAcc (会计专硕) thesis project.
---

# Research Pipeline Planner

This skill is the Oh-my--paper controller. Keep it at the project orchestration level: it sets stages, updates pipeline state, assigns next actions, and routes to specialized skills. Do not move MPAcc topic standards, chapter-writing rules, citation checks, or quality checklists into this controller; route those tasks to `mpacc-thesis-writer`.

## MPAcc Stage Mapping

| Oh-my--paper stage | MPAcc thesis meaning | Primary routed skill |
|---|---|---|
| survey | collect school requirements, case facts, public evidence, literature, and material gaps | `mpacc-thesis-writer`, survey/search skills |
| ideation | converge topic, research problem, case design, evidence boundary, and provisional answer | `research-idea-convergence`, `mpacc-thesis-writer` |
| experiment | build evidence matrix, method-data fit, tool/application design, calculations, or case comparison | `mpacc-thesis-writer` |
| publication | draft proposal, literature review, outline, chapters, citation plan, and revisions | `inno-paper-writing`, `mpacc-thesis-writer` |
| promotion | prepare defense slides, Q&A, oral defense notes, and final handoff | `mpacc-thesis-writer`, presentation skills |

## Goals

- clarify the MPAcc thesis topic, official thesis form, analytical pattern, case design, and expected contribution;
- set or revise the starting stage without rebuilding earlier work unnecessarily;
- update `.pipeline/docs/research_brief.json`;
- update `.pipeline/tasks/tasks.json`;
- set a concrete `nextActionPrompt` that invokes the correct specialized skill.

## Working Rules

1. Read `instance.json`, `.pipeline/docs/research_brief.json`, and `.pipeline/tasks/tasks.json` first if they exist.
2. Keep the pipeline aligned with the five stages above, but interpret them through the MPAcc thesis mapping.
3. When the user already has a topic, outline, proposal, draft, or advisor feedback, move the starting stage forward instead of restarting at survey.
4. Do not invent citations, enterprise data, interviews, internal documents, case facts, or method results.
5. When entering ideation, route through `research-idea-convergence`; it must present candidate topics or refinements and wait for the user checkpoint.
6. Ensure every stage transition involves a user checkpoint. Do not skip stages or auto-advance without user confirmation.
7. Enforce linear execution: survey before ideation, ideation before evidence/method design, evidence/method design before full drafting, drafting before defense prep.
8. For any MPAcc-specific content decision, route to `mpacc-thesis-writer` rather than embedding detailed standards here.

## Expected Outputs

- a concise research brief with: topic, real problem, official thesis form, analytical pattern, case design, evidence boundary, current stage, and stage notes;
- a task list with dependencies, suggested skills, and a concrete next action;
- for ideation: candidate topics or refinements presented via `research-idea-convergence` before any final topic file is written.
