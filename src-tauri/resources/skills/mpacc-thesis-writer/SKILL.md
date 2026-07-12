---
id: mpacc-thesis-writer
name: mpacc-thesis-writer
version: 1.0.0
description: |-
  Draft, structure, revise, and quality-check MPAcc (会计专硕) graduation thesis work from topic selection through defense, using local MPAcc topic standards and user-provided evidence.
stages: ["ideation", "publication", "promotion"]
tools: ["read_file", "search_project", "write_file", "run_terminal"]
summary: |-
  MPAcc thesis specialist for accounting-master topic selection, proposal, literature review, case analysis, outline, chapter drafting, citation planning, revision, quality review, and defense prep. Use local topic standards before excellent-thesis patterns.
primaryIntent: writing
intents: ["ideation", "writing", "evaluation"]
capabilities: ["research-planning", "visualization-reporting", "evaluation-benchmarking"]
domains: ["accounting", "mpacc", "management"]
keywords: ["mpacc", "会计专硕", "毕业论文", "选题", "开题报告", "案例分析", "文献综述", "论文写作", "答辩", "citation audit"]
source: local
status: verified
resourceFlags:
  hasReferences: true
  hasScripts: true
  hasTemplates: false
  hasAssets: true
  referenceCount: 19
  scriptCount: 2
  templateCount: 0
  assetCount: 8
  optionalScripts: true
---

# MPAcc Thesis Writer

Use this skill as a writing scaffold and quality system for MPAcc theses. The bundled references contain abstracted methodology from full-text reading of the provided excellent theses; they do not contain source thesis text, thesis data, or reusable paragraphs.

Core rule: require user-provided topic, school requirements, case materials, and runtime reference literature before drafting a real thesis. Never fabricate enterprise data, interviews, policy documents, or citations. When facts are missing, write an explicit placeholder such as `〔待补：XX 公司 2023 年营业收入，来源建议：年报 P.XX〕`.

Integrity rule: on first entry and final delivery, remind the user that outputs are drafts/scaffolding the student must substantially revise, verify, and own; all data and citations must be real; the user must follow and disclose AI assistance according to school policy.

Topic standard rule: for topic selection, follow the local MPAcc standards before using excellent-thesis patterns. A topic must start from a real professional problem, not from a fashionable method, an available sample pair, or a broad field. Reject or revise topics that need invented concepts, reconstructed indicators, or data stretching to make the problem visible.

## Entry Routing

| User state | Action |
|---|---|
| Only a broad direction | Read `topic-selection-framework.md`; turn the broad field into a real problem, research question, provisional answer, case design, and evidence boundary before proposing titles. |
| Topic set, no materials | Read `case-material-intake.md`; ask for school format, case facts, and reference literature. |
| Proposal or opening report | Read `proposal-and-litreview-deliverables.md`, `topic-selection-framework.md`, and `formatting-rules.md`. |
| Standalone literature review | Read `literature-review-method.md` and `runtime-literature-selection.md`. |
| Outline needed | Read `thesis-structure-and-patterns.md`, `chapter-writing-rules.md`, and relevant framework files. |
| Chapter drafting | Read `chapter-writing-rules.md`; add `theoretical-basis-guide.md`, `case-analysis-framework.md`, or `problem-cause-solution-logic.md` as needed. |
| Method-heavy thesis | Read `method-data-fit-guide.md` before accepting AHP, fuzzy AHP, fsQCA, event study, ML/text analysis, social network analysis, or accounting-model construction. |
| Single-case or multi-case design | Read `case-analysis-framework.md`; identify whether the case is extreme, illuminating, longitudinal, competitive, equifinal, two-tail, or variation design. |
| Advisor feedback / revision | Map feedback to chapters, then read `problem-cause-solution-logic.md` and `quality-checklist.md`. |
| Citation audit | Run `scripts/check_citations.py`; flag missing, unused, out-of-list, or broken citations. |
| Defense prep | Read `defense-prep.md`; generate questions, answer points, and presentation outline from the confirmed draft. |
| Skill audit or provenance review | Read `full-read-analysis-cards.md`, `refinement-trace.md`, and `evaluation-report.md`. |

## Workflow

1. Confirm the writing task and integrity constraints. If word count, chapter numbering, citation style, or school template is unknown, ask or use placeholders; do not default to a 60,000-word thesis.
2. Restore state if the user provides a project snapshot. Otherwise create a working snapshot from `assets/project-state-template.md`.
3. For topic work, complete the selection gate before drafting: real observation, standard indicator or public-event evidence, research question, provisional answer/main claim, official thesis form, analytical pattern, and case design.
4. Collect case materials using `assets/case-intake-template.md`. Mark every data gap with `〔待补：...〕`.
5. Classify both the official thesis form and the analytical pattern before outlining. Official forms include case analysis report, thematic research paper, survey report, scheme design, and product design. Analytical patterns include optimization, mechanism/effect, model/accounting treatment, event/spillover, configuration, staged path, or intelligent-technology application.
6. If references are provided, read `runtime-literature-selection.md`; optionally run `scripts/build_literature_matrix.py`; create a literature matrix and chapter-by-chapter citation plan before drafting.
7. If a method is proposed, verify method-data fit with `method-data-fit-guide.md` before promising results.
8. Confirm an outline before writing full chapters. For each chapter, write to a separate file when the environment supports file work.
9. Keep theory, framework, evidence, diagnosis, and recommendations aligned. Every recommendation must trace to a diagnosed problem and evidence source.
10. At checkpoints after outline confirmation, chapter completion, major revision, or user pause, refresh the project snapshot. Do not depend on a session-end event.
11. Before final delivery, run citation and quality checks, flag generic/template-like prose, and repeat the integrity reminder.

## Resources

| Need | Read or use |
|---|---|
| Structure, common patterns, title/abstract logic | `references/thesis-structure-and-patterns.md` |
| Topic selection and risk screening | `references/topic-selection-framework.md` |
| Chapter-by-chapter drafting | `references/chapter-writing-rules.md` |
| Theory selection and theory-to-analysis mapping | `references/theoretical-basis-guide.md` |
| Literature review synthesis | `references/literature-review-method.md` |
| Runtime literature matrix and citation plan | `references/runtime-literature-selection.md`, `scripts/build_literature_matrix.py` |
| Case analysis frameworks | `references/case-analysis-framework.md` |
| Method-data fit | `references/method-data-fit-guide.md` |
| Case material collection and data gaps | `references/case-material-intake.md`, `assets/case-intake-template.md` |
| Problem-cause-solution alignment | `references/problem-cause-solution-logic.md` |
| Academic style and anti-generic prose | `references/academic-style-guide.md` |
| Default formatting | `references/formatting-rules.md` |
| Proposal and standalone literature review | `references/proposal-and-litreview-deliverables.md` |
| Defense preparation | `references/defense-prep.md`, `assets/defense-qa-template.md` |
| Academic integrity | `references/academic-integrity.md` |
| Final review | `references/quality-checklist.md`, `scripts/check_citations.py` |
| Provenance and validation audit | `references/full-read-analysis-cards.md`, `references/refinement-trace.md`, `references/evaluation-report.md` |
