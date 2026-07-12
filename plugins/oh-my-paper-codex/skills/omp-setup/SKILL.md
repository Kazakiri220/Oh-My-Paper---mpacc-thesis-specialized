---
name: omp-setup
description: "Initialize or repair an Oh My Paper thesis project. Use for project setup, Codex project configuration, and workflow bootstrap; do not use for drafting a chapter."
---

初始化当前目录中的 Oh My Paper MPAcc 论文项目。先检查而非覆盖：保留已有 `.pipeline/`、论文文件、`.claude/` 配置和用户资料。

## 检查

1. 确认当前目录是否已有 `.pipeline/`、`.agents/skills/`、`.codex/agents/` 和 `.codex/hooks.json`。
2. 运行 `codex --version`；提示用户在新会话中用 `/skills` 和 `/hooks` 检查插件发现与 hook 信任。
3. 只有缺少必要信息（起始阶段、学校要求、研究方向/案例）时才向用户询问；明确的初始化要求可直接执行。

## 经用户同意后的项目写入

创建缺失目录和文件：

- `.pipeline/memory/`、`.pipeline/tasks/`、`.pipeline/docs/`、`materials/`、`sections/`
- `.agents/skills/` 中的 `mpacc-thesis-writer` 与当前任务所需的核心 Skills
- `.codex/agents/conductor.toml`、`literature-scout.toml`、`evidence-driver.toml`、`paper-writer.toml`、`reviewer.toml`；模板位于 `${PLUGIN_ROOT}/agents/`
- `.codex/hooks.json` 与 `.codex/hooks/`；模板位于 `${PLUGIN_ROOT}/hooks/` 和 `${PLUGIN_ROOT}/scripts/`，保留 `commandWindows` 字段
- 精简的 `AGENTS.md`，包含证据边界、文件路由和验证规则

不要把 Claude 的 `settings.json`、Markdown personas 或 slash-command 配置复制进 `.codex/`。保留现有 `.claude/` 视图以兼容 Claude Code。

## 初始状态

若不存在，创建 `.pipeline/docs/research_brief.json`、`.pipeline/memory/project_truth.md`、`execution_context.md`、`orchestrator_state.md`、`review_log.md`、`agent_handoff.md`、`decision_log.md`、`literature_bank.md`、`experiment_ledger.md` 和 `.pipeline/tasks/tasks.json`。

所有事实、案例材料、政策和引用必须标明来源或缺口；不得填造内容。完成后报告创建/保留的文件，并建议用户运行 `$omp-plan`、`$omp-survey` 或 `$omp-sync`。
