<p align="center">
  <img src="./src/assets/qrcode.jpg" alt="交流群二维码" width="180" />
  <br/>
  <em>扫码加入交流群</em>
</p>

<p align="center">
  <img src="./icons/icon.png" alt="Oh My Paper - mpacc-thesis-specialized" width="120" height="120" />
</p>

<h1 align="center">Oh My Paper - mpacc-thesis-specialized</h1>

<p align="center">
  <strong>A Claude Code / Codex workspace specialized for MPAcc thesis writing.</strong>
</p>

<p align="center">
  This project is an MPAcc thesis-writing specialized edition of <a href="https://github.com/LigphiDonk/Oh-my--paper">https://github.com/LigphiDonk/Oh-my--paper</a>.
</p>

<p align="center">
  <a href="./README.zh.md">中文文档</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/claude--code-plugin-blueviolet?style=flat-square" />
  <img src="https://img.shields.io/badge/agents-5-ff69b4?style=flat-square" />
  <img src="https://img.shields.io/badge/skills-MPAcc--focused-green?style=flat-square" />
  <img src="https://img.shields.io/badge/commands-8-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/license-MIT-orange?style=flat-square" />
</p>

---

## TL;DR

Choose the runtime you use:

**Claude Code**

```bash
/plugin marketplace add Kazakiri220/Oh-My-Paper---mpacc-thesis-specialized
/plugin install omp@oh-my-paper
```

Restart Claude Code, then run `/omp:setup` inside your MPAcc thesis project.

**Codex**

Use the operating-system-specific commands in [Install for Codex](#install-for-codex). After installation, open a new Codex session and verify `/skills` before using `$omp-setup`.

---

## Table of Contents

- [Why This Exists](#why-this-exists)
- [Install](#install)
- [Claude Code Slash Commands](#claude-code-slash-commands)
- [Codex Usage and Differences](#codex-usage-and-differences)
- [The MPAcc Agent Team](#the-mpacc-agent-team)
- [MPAcc Thesis Skill Chain](#mpacc-thesis-skill-chain)
- [Hooks](#hooks)
- [MPAcc Thesis Pipeline](#mpacc-thesis-pipeline)
- [Project Scaffold](#project-scaffold)
- [How Memory Works](#how-memory-works)
- [Codex Delegation](#codex-delegation)
- [Evidence And Method Fit](#evidence-and-method-fit)
- [For LLM Agents](#for-llm-agents)
- [Philosophy](#philosophy)
- [Contributing](#contributing)
- [Uninstall](#uninstall)

---

## Why This Exists

Claude Code is already a great coding agent. But **an MPAcc thesis is not just drafting text** — it requires topic standards, case evidence, literature survey, method fit, proposal writing, thesis chapters, reference checks, and defense preparation.

Oh My Paper - mpacc-thesis-specialized organizes Claude Code / Codex around MPAcc thesis constraints:

- **A structured 5-stage pipeline** — Survey → Topic Convergence → Evidence/Method Fit → Writing → Defense
- **5 MPAcc agent roles** — orchestration, materials, evidence/method fit, writing, and review
- **An MPAcc thesis skill chain** — from topic hard gates to case evidence, writing, citations, and defense
- **Background hooks** — auto-inject project context at session start, prompt role selection, track task completion
- **Codex delegation** — hand off parallel tasks to Codex in a separate terminal

Install it and forget about it. Your sessions get smarter. Your thesis progress stays organized.

---

## Install

### Install for Claude Code

#### Step 1: Add the marketplace

```bash
/plugin marketplace add Kazakiri220/Oh-My-Paper---mpacc-thesis-specialized
```

#### Step 2: Install the plugin

```bash
/plugin install omp@oh-my-paper
```

#### Step 3: Restart Claude Code

Required for hooks to activate.

#### Step 4: Initialize your project

```bash
/omp:setup
```

This scaffolds the `.pipeline/` directory and registers the `SessionStart` hook for your project.

#### Update

The most reliable way to get the latest version:

```bash
/plugin uninstall omp
/plugin install omp@oh-my-paper
/reload-plugins
```

Or overwrite the plugin cache directly (faster, no restart needed):

```bash
cp -r /path/to/oh-my-paper/plugins/oh-my-paper/. \
  ~/.claude/plugins/cache/oh-my-paper/omp/1.0.0/
# Then in Claude Code:
/reload-plugins
```

#### Install from Local Directory

```bash
git clone https://github.com/Kazakiri220/Oh-My-Paper---mpacc-thesis-specialized.git /tmp/oh-my-paper-mpacc
# In Claude Code:
/plugin marketplace add Kazakiri220/Oh-My-Paper---mpacc-thesis-specialized
/plugin install omp@oh-my-paper
```

### Install for Codex

The Codex installer needs both `node` and `codex` on your `PATH`. It registers this clone as a local marketplace, so keep the clone while the plugin is installed.

#### macOS / Linux

```bash
git clone https://github.com/Kazakiri220/Oh-My-Paper---mpacc-thesis-specialized.git ~/oh-my-paper-mpacc
cd ~/oh-my-paper-mpacc
sh ./scripts/install-codex-plugin.sh
```

#### Windows (PowerShell)

```powershell
git clone https://github.com/Kazakiri220/Oh-My-Paper---mpacc-thesis-specialized.git "$HOME\oh-my-paper-mpacc"
Set-Location "$HOME\oh-my-paper-mpacc"
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\install-codex-plugin.ps1
```

#### Windows (Command Prompt)

```cmd
git clone https://github.com/Kazakiri220/Oh-My-Paper---mpacc-thesis-specialized.git "%USERPROFILE%\oh-my-paper-mpacc"
cd /d "%USERPROFILE%\oh-my-paper-mpacc"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install-codex-plugin.ps1
```

Do not run `sh ./scripts/install-codex-plugin.sh` in Windows PowerShell or Command Prompt; `sh` is for macOS/Linux, Git Bash, or WSL. After installing, open a new Codex session, check `/skills`, and use `$omp-setup` to initialize a thesis project. Use `/hooks` to review and explicitly trust the bundled hooks. Run `node scripts/manage-codex-plugin.mjs status` to inspect the installation; pull updates and rerun the matching installer to upgrade.

---

## Claude Code Slash Commands

These slash commands are provided by the **Claude Code plugin**.
The Codex plugin does **not** currently auto-register `/omp-*` commands in the Codex CLI.

All commands are prefixed with `/omp:`.

| Command | What It Does |
|---------|-------------|
| `/omp:setup` | Scaffold a new research project — creates `.pipeline/`, memory files, and registers the SessionStart hook |
| `/omp:survey` | Collect topic standards, case evidence, policy materials, and literature |
| `/omp:ideate` | Generate, screen, and converge MPAcc thesis topics |
| `/omp:experiment` | Build the evidence matrix and check method-material fit |
| `/omp:write` | Draft proposal, review, outline, chapters, figures, and citation checks |
| `/omp:review` | Review topic gates, evidence chain, structure, and citations |
| `/omp:delegate` | Generate a Codex prompt for evidence, drafting, or citation sub-tasks |
| `/omp:plan` | Review global progress, confirm next steps, update research plan |

### Quick Start

```bash
/omp:setup          # scaffold the project
/omp:survey         # collect standards, case materials, and literature
/omp:ideate         # converge an MPAcc thesis topic
/omp:experiment     # build evidence matrix and check method fit
/omp:write          # draft proposal, review, outline, and chapters
/omp:review         # final quality gate
```

---

## The MPAcc Agent Team

When you open Claude Code in an Oh My Paper - mpacc-thesis-specialized project, the `SessionStart` hook fires and Claude immediately asks which role you want to take on. Each role has **isolated memory** — it only reads and writes the files it needs.

| Role | Responsibility | Memory Scope |
|------|---------------|-------------|
| **Conductor** | Uses `research-pipeline-planner` as controller; maintains stages, tasks, decisions, and quality gates | `project_truth` · `orchestrator_state` · `tasks.json` · `review_log` · `agent_handoff` · `decision_log` |
| **Literature Scout** | Collects school topic standards, public case evidence, policy materials, and MPAcc literature | `project_truth` · `execution_context` · `literature_bank` · `decision_log` |
| **Evidence Driver** | Builds the evidence matrix and checks method-material fit, chapter support, and writability | `execution_context` · `evidence_ledger` · `research_brief.json` · `project_truth` |
| **Paper Writer** | Drafts proposal, literature review, outline, chapters, figures, and citation notes | `execution_context` · `result_summary` · `literature_bank` · `agent_handoff` |
| **Reviewer** | Reviews topic hard gates, evidence chain, chapter logic, and citation integrity under MPAcc standards | `execution_context` · `project_truth` · `result_summary` |

### How It Works

```
Session opens
    → SessionStart hook fires
        → Claude asks: which role today?
            → Agent loads role-specific memory files
                → Works as that persona
                    → On subtask complete: auto-updates tasks.json + project_truth
                        → Next session picks up right where you left off
```

**Key design decisions:**

- **Memory isolation** — the Paper Writer can't see the Conductor's orchestrator state; the Literature Scout can't see method-fit conclusions. This prevents context pollution.
- **Shared state** — `tasks.json` and `project_truth.md` are the common ground, updated by all roles after each subtask.
- **No manual sync** — the Conductor auto-updates `tasks.json` (marks tasks `done`) and appends a progress entry to `project_truth.md` whenever a subtask completes, without waiting for you to ask.

---

## MPAcc Thesis Skill Chain

Skills are structured instruction sets that Claude / Codex loads on demand. This specialized edition organizes skill descriptions around MPAcc topic selection, materials, method fit, writing, review, and defense.

<details>
<summary><strong>Click to expand the MPAcc skill chain</strong></summary>

| Category | Skills | Purpose |
|----------|--------|---------|
| **Control & Planning** | `research-pipeline-planner` · `inno-pipeline-planner` | Keep the five-stage pipeline, `research_brief.json`, and task tree aligned |
| **MPAcc Standards** | `mpacc-thesis-writer` | Core rules for topic standards, case materials, chapter structure, method fit, citations, and defense |
| **Topic Convergence** | `research-idea-convergence` · `mpacc-thesis-writer` | Converge a direction into an MPAcc topic that fits school standards and evidence conditions |
| **Materials & Literature** | `inno-deep-research` · `academic-researcher` · `paper-finder` · `paper-analyzer` | Organize case evidence, policy materials, literature records, and research gaps |
| **Writing & Figures** | `inno-paper-writing` · `mpacc-thesis-writer` · `inno-figure-gen` | Produce proposal, literature review, outline, chapters, case figures, and analysis tables |
| **Review & Citations** | `inno-paper-reviewer` · `inno-reference-audit` · `mpacc-thesis-writer` | Check topic failures, evidence chain, chapter logic, citation integrity, and format risk |
| **Defense Prep** | `making-academic-presentations` · `mpacc-thesis-writer` | Prepare defense outline, Q&A, oral script, and presentation materials |
| **Agent Dispatch** | `claude-code-dispatch` · `codex-dispatch` | Delegate material organization, evidence checks, drafting, and citation review |

</details>

Skills are auto-recommended based on the current MPAcc thesis stage. Add project-local skills in the `skills/` directory.

---

## Hooks

Oh My Paper - mpacc-thesis-specialized registers three hooks that run in the background:

| Hook | Trigger | What It Does |
|------|---------|-------------|
| **SessionStart** | Every time you open Claude Code in this project | Outputs project context to Claude — current stage, active task, last handoff — then prompts you to pick a role via `AskUserQuestion` |
| **Stop** | When a task completes | Tracks task completion, updates `tasks.json` |
| **PostToolUse (Write)** | After any file write | Detects pipeline stage transitions |

**Important:** Hooks only activate after running `/omp:setup` in your project. Setup registers the `SessionStart` hook in `.claude/settings.json` and creates the `.pipeline/` directory that the hook checks.

---

## MPAcc Thesis Pipeline

A structured 5-stage workflow from topic selection to defense:

```
┌──────────┐    ┌──────────┐    ┌────────────┐    ┌─────────────┐    ┌───────────┐
│  Survey  │ →  │  Topic   │ →  │ Evidence   │ →  │  Writing    │ →  │ Defense   │
└──────────┘    └──────────┘    └────────────┘    └─────────────┘    └───────────┘
```

Each stage comes with:
- **Auto-generated task trees** — what to do next
- **Recommended skills** — which skills to load
- **Context-aware prompts** — agents read `tasks.json` and `research_brief.json` and know what to do

---

## Project Scaffold

`/omp:setup` creates this structure:

```
my-mpacc-thesis/
├── paper/                  # LaTeX workspace
│   ├── main.tex
│   ├── sections/
│   └── refs/
├── materials/              # Case materials, topic standards, public evidence
├── survey/                 # Standards, case evidence, literature artifacts
├── ideation/               # Topic candidates, hard-gate reviews, decisions
├── promotion/              # Defense materials
├── skills/                 # Project-local skills
├── .pipeline/
│   ├── tasks/
│   │   └── tasks.json      # Task tree across all stages
│   ├── docs/
│   │   └── research_brief.json
│   └── memory/             # Agent memory files
├── .claude/
│   └── settings.json       # SessionStart hook registration
├── CLAUDE.md
└── AGENTS.md
```

---

## How Memory Works

Each agent role reads and writes specific memory files. The Conductor is responsible for keeping shared state in sync.

```
.pipeline/memory/
├── project_truth.md        # Ground truth + progress log (appended after each subtask)
├── orchestrator_state.md   # Conductor's planning state
├── execution_context.md    # Current task context for executors
├── evidence_ledger.md      # Evidence audit history
├── result_summary.md       # Writability conclusion for writing & review
├── review_log.md           # Review feedback history
├── literature_bank.md      # Organized paper notes
├── agent_handoff.md        # Cross-agent handoff messages
└── decision_log.md         # Rejected directions & reasoning

.pipeline/tasks/
└── tasks.json              # Shared task tree (all roles read/write this)
```

Memory survives across sessions. The `SessionStart` hook reads these files and injects the relevant context — you pick up right where you left off.

**Auto-sync rule:** The Conductor updates `tasks.json` and `project_truth.md` automatically after every subtask completes (delegate / evidence-fit / survey / write / review). You never need to ask it to sync.

---

## Codex Delegation

The Conductor can hand off evidence checks, drafting, citation audits, and material organization to Codex:

```bash
/omp:delegate
```

The flow:
1. Conductor reads project context and the current task
2. Presents task summary — you confirm
3. Generates a complete Codex prompt with context pre-injected
4. You copy it to a new terminal: `codex "..."`
5. Conductor polls for completion (`CODEX_DONE` signal in `agent_handoff.md`)
6. Reads result, asks you to accept/revise/reject
7. On accept: updates `tasks.json` and `project_truth.md` automatically

---

## Evidence And Method Fit

The `mpacc-thesis-writer` skill + `/omp:experiment` support the MPAcc evidence and method-fit loop:

```
Select topic → Build evidence matrix → Check method fit → Write writability conclusion → Sync state
```

- Separate available, publicly accessible, user-needed, and unavailable evidence
- Map each evidence item to thesis chapters and claims
- Conclusions flow back into `evidence_ledger.md` and `result_summary.md` for the Paper Writer

---

## For LLM Agents

If you're an AI agent installing this plugin:

```bash
# Step 1: Add marketplace
/plugin marketplace add Kazakiri220/Oh-My-Paper---mpacc-thesis-specialized

# Step 2: Install plugin
/plugin install omp@oh-my-paper

# Step 3: Verify installation
/plugin
# Should show: omp @ oh-my-paper, Status: Enabled

# Step 4: User must restart Claude Code (you cannot do this)
# Tell user: "Please restart Claude Code to activate hooks."

# Step 5: Initialize project
/omp:setup
```

---

## Philosophy

> **Enhance, don't replace.** Claude Code is already smart — this project adds MPAcc thesis structure, not overrides.

- **Your context is for reasoning** — hooks inject only what's needed; memory files keep the rest on disk
- **Domain-specific, not generic** — every skill, agent, and command is designed for MPAcc thesis writing
- **Invisible when not needed** — hooks run in the background; no noise if you're just coding
- **Composable** — use one command, use all of them, or just let the hooks do their thing
- **Memory over repetition** — agents remember project context so you don't re-explain every session

---

## Contributing

PRs welcome. If you add a new skill, put it in `skills/` with proper YAML frontmatter and update `research-catalog.json`.

Any change to cached content requires version bumps in **both**:
- `plugins/oh-my-paper/.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`

---

## Codex Usage and Differences

Oh My Paper - mpacc-thesis-specialized also ships a **Codex plugin** (`oh-my-paper-codex`) that shares the same MPAcc thesis harness concepts, agents, and skills as the Claude Code plugin.

### Use in Codex CLI

After installation, start Codex in your MPAcc thesis project directory:

```bash
cd /path/to/your/mpacc-thesis-project
codex
```

First verify that `/skills` shows the OMP Skills, then invoke them by name:

- `$omp-setup` — initialize or repair the thesis-project scaffold.
- `$omp-sync` — reconcile `.pipeline` state and select the next task.
- `$omp-plan`, `$omp-survey`, `$omp-ideate`, `$omp-experiment`, `$omp-write`, `$omp-review`, `$omp-delegate` — run the matching workflow.
- Natural language is also supported, for example: `Synchronize this thesis project's progress and recommend the next evidence-grounded task.`

Native Codex names use hyphens: `$omp-sync`, not `$omp:sync`. Oh My Paper's own chat UI may accept the colon form as a compatibility input, but native Codex does not.

Use `/hooks` to inspect and explicitly trust the OMP hooks before relying on SessionStart, Stop, or PostToolUse behavior. Hooks are never enabled by a bypass flag.

### What's Included

| Feature | Claude Code | Codex CLI |
|:---|:---|:---|
| Agent Roles (5) | `agents/*.md` | `agents/*.toml` |
| Workflow entrypoints | `/omp:...` slash commands | `$omp-*` Skill mentions + natural language |
| SessionStart Hook | Native hook | Native hook after `/hooks` trust |
| Skills | ✅ shared | 9 OMP workflows + 6 curated core Skills |
| `.pipeline/` Memory | ✅ | ✅ |
| Codex Delegation | `/omp:delegate` → new terminal | Native `/agent` subagent |

### Key Differences

- **Hooks**: Codex supports native project and bundled hooks. Review them with `/hooks` and trust only the copies you have inspected; `AGENTS.md` remains durable project guidance, not a hook replacement.
- **CLI command model**: Claude Code exposes `/omp:...` slash commands. Codex uses `$omp-*` Skill mentions; `$omp:...` is only an optional Oh My Paper UI compatibility input.
- **Both can coexist**: The Codex plugin (`plugins/oh-my-paper-codex/`) is completely separate from the Claude Code plugin (`plugins/oh-my-paper/`). Installing one does not affect the other.
- **Installer scripts**: Use `sh scripts/install-codex-plugin.sh` on macOS/Linux or `scripts/install-codex-plugin.ps1` on Windows. They install only this repository's marketplace/plugin and do not overwrite unrelated plugins.
- **Codex discovery**: The installer uses `codex plugin marketplace add` and `codex plugin add`; use `codex plugin list --available --json` to diagnose marketplace and installation state.
- **Fresh installation**: Validate `/skills` in a new session and `/hooks` after trust. The normal test suite uses a fake CLI and never spends model credits.

---

## Uninstall

**Claude Code:**
```bash
/plugin uninstall omp@oh-my-paper
```

**Codex (any platform):**

```bash
codex plugin remove oh-my-paper-codex@oh-my-paper-codex
```

This removes the plugin and leaves its marketplace configured, which makes a later reinstall straightforward.

**Codex complete cleanup from the local clone (macOS / Linux):**

```bash
sh ./scripts/uninstall-codex-plugin.sh --remove-marketplace
```

**Codex complete cleanup from the local clone (Windows / PowerShell):**

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\uninstall-codex-plugin.ps1 --remove-marketplace
```

The complete-cleanup option removes the marketplace only when it does not provide any other plugins; otherwise it stops safely. Omit `--remove-marketplace` to retain the marketplace.

---

## License

MIT. See [LICENSE](./LICENSE).

---

## Acknowledgments

Special thanks to the **[Linux.do](https://linux.do)** community for your support and feedback.

---

<p align="center">
  <strong>Oh My Paper - mpacc-thesis-specialized</strong> — MPAcc thesis writing, organized in the terminal.
</p>
