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
  <strong>面向会计专硕（MPAcc）学位论文写作的 Claude Code / Codex 工作台。</strong>
</p>

<p align="center">
  本项目是 <a href="https://github.com/LigphiDonk/Oh-my--paper">https://github.com/LigphiDonk/Oh-my--paper</a> 的 MPAcc 论文写作特化版。
</p>

<p align="center">
  <a href="./README.md">English</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/claude--code-plugin-blueviolet?style=flat-square" />
  <img src="https://img.shields.io/badge/agents-5-ff69b4?style=flat-square" />
  <img src="https://img.shields.io/badge/skills-MPAcc--focused-green?style=flat-square" />
  <img src="https://img.shields.io/badge/commands-8-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/license-MIT-orange?style=flat-square" />
</p>

---

## 快速开始

选择你使用的运行时：

**Claude Code**

```bash
/plugin marketplace add Kazakiri220/Oh-My-Paper---mpacc-thesis-specialized
/plugin install omp@oh-my-paper
```

重启 Claude Code 后，在你的 MPAcc 论文项目里运行 `/omp:setup`。

**Codex**

请使用下方[在 Codex 上安装](#在-codex-上安装)中的系统对应命令。安装完成后新开一个 Codex 会话，先确认 `/skills`，再使用 `$omp-setup`。

---

## 目录

- [为什么做这个](#为什么做这个)
- [安装](#安装)
- [Claude Code 命令列表](#claude-code-命令列表)
- [Codex 使用与差异](#codex-使用与差异)
- [MPAcc Agent 团队](#mpacc-agent-团队)
- [MPAcc 论文技能链](#mpacc-论文技能链)
- [Hooks](#hooks)
- [MPAcc 论文流水线](#mpacc-论文流水线)
- [项目结构](#项目结构)
- [记忆系统](#记忆系统)
- [Codex 任务委派](#codex-任务委派)
- [证据与方法适配](#证据与方法适配)
- [给 AI Agent 看](#给-ai-agent-看)
- [设计理念](#设计理念)
- [贡献](#贡献)
- [卸载](#卸载)

---

## 为什么做这个

Claude Code 是很强的编程 agent，但**MPAcc 论文不只是写正文** —— 还有选题标准、案例证据、文献调研、方法适配、开题报告、正文撰写、引用核查和答辩准备。

Oh My Paper - mpacc-thesis-specialized 让 Claude Code / Codex 按 MPAcc 学位论文的约束组织工作：

- **结构化 5 阶段流水线** — 调研 → 选题收敛 → 证据与方法适配 → 写作 → 答辩
- **5 个 MPAcc agent 角色** — 分别负责总控、材料、证据方法、写作和审查
- **MPAcc 论文技能链** — 从选题硬门槛到案例证据、正文写作、引用和答辩
- **后台 hooks** — 每次开会话自动注入项目上下文、触发角色选择
- **Codex 任务委派** — 把并行任务交给另一个终端里的 Codex 跑

装好就不用管了。会话越来越智能，论文进展有人帮你记。

---

## 安装

### 安装 Claude Code 插件

#### 第一步：添加 marketplace

```bash
/plugin marketplace add Kazakiri220/Oh-My-Paper---mpacc-thesis-specialized
```

#### 第二步：安装插件

```bash
/plugin install omp@oh-my-paper
```

#### 第三步：重启 Claude Code

hooks 需要重启才能生效。

#### 第四步：初始化项目

```bash
/omp:setup
```

这一步会创建 `.pipeline/` 目录，并把 SessionStart hook 注册到项目的 `.claude/settings.json`。

#### 更新插件

最可靠的更新方式：

```bash
/plugin uninstall omp
/plugin install omp@oh-my-paper
/reload-plugins
```

或者直接覆盖插件缓存（更快，不需要重启）：

```bash
cp -r /path/to/oh-my-paper/plugins/oh-my-paper/. \
  ~/.claude/plugins/cache/oh-my-paper/omp/1.0.0/
# 然后在 Claude Code 里：
/reload-plugins
```

#### 从本地目录安装

```bash
git clone https://github.com/Kazakiri220/Oh-My-Paper---mpacc-thesis-specialized.git /tmp/oh-my-paper-mpacc
# 在 Claude Code 里：
/plugin marketplace add Kazakiri220/Oh-My-Paper---mpacc-thesis-specialized
/plugin install omp@oh-my-paper
```

### 在 Codex 上安装

Codex 安装器要求 `node` 和 `codex` 都在 `PATH` 中。它会把这个克隆目录注册为本地 marketplace，所以插件安装期间请保留该目录。

#### macOS / Linux

```bash
git clone https://github.com/Kazakiri220/Oh-My-Paper---mpacc-thesis-specialized.git ~/oh-my-paper-mpacc
cd ~/oh-my-paper-mpacc
sh ./scripts/install-codex-plugin.sh
```

#### Windows（PowerShell）

```powershell
git clone https://github.com/Kazakiri220/Oh-My-Paper---mpacc-thesis-specialized.git "$HOME\oh-my-paper-mpacc"
Set-Location "$HOME\oh-my-paper-mpacc"
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\install-codex-plugin.ps1
```

#### Windows（命令提示符 / CMD）

```cmd
git clone https://github.com/Kazakiri220/Oh-My-Paper---mpacc-thesis-specialized.git "%USERPROFILE%\oh-my-paper-mpacc"
cd /d "%USERPROFILE%\oh-my-paper-mpacc"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install-codex-plugin.ps1
```

不要在 Windows PowerShell 或 CMD 中运行 `sh ./scripts/install-codex-plugin.sh`；`sh` 仅适用于 macOS/Linux、Git Bash 或 WSL。安装完成后新开 Codex 会话，用 `/skills` 核对 Skills，再用 `$omp-setup` 初始化论文项目；通过 `/hooks` 审查并显式信任 bundled hooks。可运行 `node scripts/manage-codex-plugin.mjs status` 查看安装状态；拉取更新后重跑对应安装脚本即可升级。

---

## Claude Code 命令列表

这些命令由 **Claude Code 插件**提供。
Codex 插件目前**不会**在 Codex CLI 里自动注册 `/omp-*` 命令。

所有命令以 `/omp:` 开头。

| 命令 | 作用 |
|------|------|
| `/omp:setup` | 初始化研究项目——创建 `.pipeline/`、记忆文件，注册 SessionStart hook |
| `/omp:survey` | 收集选题标准、案例证据、政策材料和文献，整理 `literature_bank.md` |
| `/omp:ideate` | 基于标准和证据生成、审查并收敛 MPAcc 论文题目 |
| `/omp:experiment` | 建立证据矩阵，检查方法-材料适配和可写性 |
| `/omp:write` | 撰写开题、综述、提纲、正文、图表和引用审查 |
| `/omp:review` | 按 MPAcc 标准审查选题、证据链、结构和引用 |
| `/omp:delegate` | 生成 Codex prompt 委派材料整理、证据核查、章节草拟或引用审查任务 |
| `/omp:plan` | 查看全局进展，确认下一步方向，更新研究计划 |

### 典型用法

```bash
/omp:setup          # 初始化项目
/omp:survey         # 收集选题标准、案例材料和文献
/omp:ideate         # 收敛 MPAcc 论文题目
/omp:experiment     # 建证据矩阵并检查方法适配
/omp:write          # 撰写开题、综述、提纲和正文
/omp:review         # 最终质量把关
```

---

## MPAcc Agent 团队

在 Oh My Paper - mpacc-thesis-specialized 项目里打开 Claude Code，`SessionStart` hook 会自动触发，Claude 立即弹出角色选择。每个角色有**独立的记忆范围**——只读写它需要的文件。

| 角色 | 职责 | 记忆范围 |
|------|------|---------|
| **Conductor（总控）** | 以 `research-pipeline-planner` 为总控，维护阶段、任务、决策和质量门槛 | `project_truth` · `orchestrator_state` · `tasks.json` · `review_log` · `agent_handoff` · `decision_log` |
| **Literature Scout（标准与材料侦察）** | 收集学校选题标准、案例公开证据、政策材料和 MPAcc 相关文献 | `project_truth` · `execution_context` · `literature_bank` · `decision_log` |
| **Evidence Driver（证据与方法适配）** | 建立证据矩阵，判断方法-材料适配、章节支撑关系和可写性 | `execution_context` · `evidence_ledger` · `research_brief.json` · `project_truth` |
| **Paper Writer（论文写手）** | 撰写开题报告、文献综述、论文提纲、正文、图表和引用说明 | `execution_context` · `result_summary` · `literature_bank` · `agent_handoff` |
| **Reviewer（质量审查员）** | 按 MPAcc 标准审查选题硬门槛、证据链、章节逻辑、引用真实性 | `execution_context` · `project_truth` · `result_summary` |

### 工作流

```
开启会话
    → SessionStart hook 触发
        → Claude 弹出角色选择
            → Agent 加载对应记忆文件
                → 以该角色身份工作
                    → 子任务完成：自动更新 tasks.json + project_truth
                        → 下次会话从上次断点继续
```

**关键设计：**

- **记忆隔离** — 论文写手看不到统筹者的编排状态；文献侦察看不到证据适配结论。防止上下文污染，让每个 agent 保持专注。
- **共享状态** — `tasks.json` 和 `project_truth.md` 是所有角色的公共地带，每个子任务结束后更新。
- **无需手动同步** — Conductor 在每个子任务完成后自动把 `tasks.json` 里的任务标为 `done`，并往 `project_truth.md` 追加进展记录，不需要你提醒。

---

## MPAcc 论文技能链

技能是 Claude / Codex 按需加载的结构化指令集。这个特化版的技能描述围绕 MPAcc 论文选题、材料、方法、写作、审查和答辩组织。

<details>
<summary><strong>展开 MPAcc 技能链</strong></summary>

| 类别 | 技能 | 用途 |
|------|------|------|
| **总控与任务规划** | `research-pipeline-planner` · `inno-pipeline-planner` | 保持五阶段流水线，生成 `research_brief.json` 和任务树 |
| **MPAcc 专业标准** | `mpacc-thesis-writer` | 选题标准、案例材料、章节结构、方法适配、引用和答辩的核心规则 |
| **选题收敛** | `research-idea-convergence` · `mpacc-thesis-writer` | 将方向收敛为符合学校标准和证据条件的 MPAcc 论文题目 |
| **材料与文献** | `inno-deep-research` · `academic-researcher` · `paper-finder` · `paper-analyzer` | 整理案例证据、政策材料、文献题录和研究缺口 |
| **写作与图表** | `inno-paper-writing` · `mpacc-thesis-writer` · `inno-figure-gen` | 输出开题、综述、提纲、正文、案例图表和分析表 |
| **审查与引用** | `inno-paper-reviewer` · `inno-reference-audit` · `mpacc-thesis-writer` | 检查选题硬伤、证据链、章节逻辑、引用真实性和格式风险 |
| **答辩准备** | `making-academic-presentations` · `mpacc-thesis-writer` | 准备答辩提纲、Q&A、陈述稿和展示材料 |
| **Agent 派发** | `claude-code-dispatch` · `codex-dispatch` | 将材料整理、证据核查、章节草拟和引用审查委派给子任务 |

</details>

技能根据当前 MPAcc 论文阶段自动推荐。也可以在 `skills/` 目录下添加项目本地技能。

---

## Hooks

Oh My Paper - mpacc-thesis-specialized 注册三个后台运行的 hook：

| Hook | 触发时机 | 作用 |
|------|---------|------|
| **SessionStart** | 每次在此项目打开 Claude Code | 向 Claude 输出项目上下文（当前阶段、执行中任务、上次交接），然后通过 `AskUserQuestion` 提示选择角色 |
| **Stop** | 任务完成时 | 追踪任务完成，更新 `tasks.json` |
| **PostToolUse (Write)** | 任何文件写入后 | 检测流水线阶段跳转 |

**重要：** hook 只有在项目里跑过 `/omp:setup` 后才会生效。setup 会把 SessionStart hook 注册到 `.claude/settings.json`，并创建 hook 检测所需的 `.pipeline/` 目录。

---

## MPAcc 论文流水线

从选题到答辩的结构化 5 阶段工作流：

```
┌──────────┐    ┌──────────┐    ┌────────────┐    ┌─────────────┐    ┌───────────┐
│  调研    │ →  │  选题    │ →  │  证据方法  │ →  │    写作     │ →  │   答辩    │
│ Survey   │    │ Ideation │    │ Experiment │    │ Publication │    │ Promotion │
└──────────┘    └──────────┘    └────────────┘    └─────────────┘    └───────────┘
```

每个阶段都有：
- **自动生成的任务树** — 告诉你下一步做什么
- **推荐技能** — 该阶段应该加载哪些技能
- **上下文感知提示** — agent 读取 `tasks.json` 和 `research_brief.json`，知道该做什么

---

## 项目结构

`/omp:setup` 创建以下结构：

```
my-mpacc-thesis/
├── paper/                  # LaTeX 工作区
│   ├── main.tex
│   ├── sections/
│   └── refs/
├── materials/              # 案例材料、选题标准、公开证据
├── survey/                 # 选题标准、案例证据、文献调研产出
├── ideation/               # 题目候选、硬门槛审查、取舍记录
├── promotion/              # 答辩材料
├── skills/                 # 项目本地技能
├── .pipeline/
│   ├── tasks/
│   │   └── tasks.json      # 跨阶段任务树
│   ├── docs/
│   │   └── research_brief.json
│   └── memory/             # Agent 记忆文件
├── .claude/
│   └── settings.json       # SessionStart hook 注册
├── CLAUDE.md
└── AGENTS.md
```

---

## 记忆系统

每个角色读写特定的记忆文件。Conductor 负责维护共享状态同步。

```
.pipeline/memory/
├── project_truth.md        # 项目基准 + 进展日志（每个子任务完成后追加）
├── orchestrator_state.md   # Conductor 的编排状态
├── execution_context.md    # 当前执行任务上下文（执行者看）
├── evidence_ledger.md      # 证据核查历史
├── result_summary.md       # 可写性结论（写作和评审用）
├── review_log.md           # 评审反馈历史
├── literature_bank.md      # 整理好的文献笔记
├── agent_handoff.md        # 角色间交接消息
└── decision_log.md         # 已否决方向及理由

.pipeline/tasks/
└── tasks.json              # 共享任务树（所有角色都读写）
```

记忆文件跨会话保留。`SessionStart` hook 读取这些文件并注入相关上下文——你从上次的断点继续。

**自动同步规则：** Conductor 在每个子任务完成后（delegate / experiment / survey / write / review 任一）自动更新 `tasks.json`（标记任务为 done）并往 `project_truth.md` 追加进展记录，不需要你提醒。

---

## Codex 任务委派

Conductor 可以把材料整理、证据核查、章节草拟和引用审查任务交给 Codex 执行：

```bash
/omp:delegate
```

流程：
1. Conductor 读取项目上下文和当前任务
2. 展示任务摘要——你确认
3. 生成预注入上下文的完整 Codex prompt
4. 你复制到新终端：`codex "..."`
5. Conductor 轮询等待完成信号（`agent_handoff.md` 里的 `CODEX_DONE`）
6. 读取结果，让你接受/修改/放弃
7. 接受后：自动更新 `tasks.json` 和 `project_truth.md`

---

## 证据与方法适配

`mpacc-thesis-writer` + `/omp:experiment` 支持 MPAcc 论文的证据与方法适配循环：

```
选定题目 → 建证据矩阵 → 检查方法适配 → 输出可写性结论 → 回写项目状态
```

- 区分已获得、可公开获取、需用户补充、不可得证据
- 明确每条证据支撑的章节与论证位置
- 结论自动回写 `evidence_ledger.md` 和 `result_summary.md`，供论文写手使用

---

## 给 AI Agent 看

如果你是 AI agent 在安装此插件：

```bash
# 第一步：添加 marketplace
/plugin marketplace Kazakiri220/Oh-My-Paper---mpacc-thesis-specialized

# 第二步：安装插件
/plugin install omp@oh-my-paper

# 第三步：验证安装
/plugin
# 应该显示：omp @ oh-my-paper, Status: Enabled

# 第四步：用户必须重启 Claude Code（你无法代劳）
# 告知用户："请重启 Claude Code 以激活 hooks。"

# 第五步：初始化项目
/omp:setup
```

---

## 设计理念

> **增强，而非替代。** Claude Code 本身已经很强——这里增加的是 MPAcc 论文工作结构，不是覆盖它的判断。

- **上下文留给推理用** — hooks 只注入必要信息；其余内容留在磁盘上的记忆文件里
- **领域专用，不求通用** — 每个技能、agent 和命令都是为 MPAcc 论文写作设计的
- **不需要时无感存在** — hooks 在后台运行；你只是在写代码时不会有任何干扰
- **可组合** — 用一个命令、用全部命令，或者就让 hooks 自己跑
- **记忆胜于重复** — agent 记住项目上下文，你不用每次重新解释

---

## 贡献

欢迎 PR。新增技能请放在 `skills/` 目录，带好 YAML frontmatter，并更新 `research-catalog.json`。

任何涉及缓存内容的改动，需要同时更新以下两个文件的版本号：
- `plugins/oh-my-paper/.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`

---

## Codex 使用与差异

Oh My Paper - mpacc-thesis-specialized 同时提供 **Codex 插件**（`oh-my-paper-codex`），共享同一套 MPAcc 论文 harness 思路、agent 和 skills，但交互方式与 Claude Code 不完全相同。

### 在 Codex CLI 里怎么用

安装完成后，在你的 MPAcc 论文项目目录里启动 Codex：

```bash
cd /path/to/your/mpacc-thesis-project
codex
```

先用 `/skills` 确认能看到 OMP Skills，再按名称调用：

- `$omp-setup`：初始化或修复论文项目脚手架。
- `$omp-sync`：核对 `.pipeline` 状态并选择下一项任务。
- `$omp-plan`、`$omp-survey`、`$omp-ideate`、`$omp-experiment`、`$omp-write`、`$omp-review`、`$omp-delegate`：运行对应工作流。
- 也可以使用自然语言，例如：`同步当前论文项目的进度，并推荐下一项基于证据的任务。`

Codex 原生命名使用连字符：`$omp-sync`，而不是 `$omp:sync`。冒号形式只可作为 Oh My Paper 聊天界面的兼容输入，原生 Codex 不支持。

通过 `/hooks` 审查并显式信任 OMP hooks 后，再依赖 SessionStart、Stop 和 PostToolUse 行为；不得用绕过信任的危险参数启用 hooks。

### 包含内容

| 功能 | Claude Code | Codex CLI |
|:---|:---|:---|
| Agent 角色（5 个） | `agents/*.md` | `agents/*.toml` |
| 工作流入口 | `/omp:...` 斜杠命令 | `$omp-*` Skill mention + 自然语言 |
| SessionStart Hook | 原生 hook | `/hooks` 信任后的原生 hook |
| 技能 | ✅ 共享 | 9 个 OMP 工作流 + 6 个精选核心 Skill |
| `.pipeline/` 记忆 | ✅ | ✅ |
| Codex 任务委派 | `/omp:delegate` → 新终端 | 原生 `/agent` 子代理 |

### 关键差异

- **Hooks**：Codex 支持原生项目 hooks 和插件 bundled hooks。先用 `/hooks` 审查并信任；`AGENTS.md` 是长期项目约定，不是 hook 的替代品。
- **CLI 命令模型**：Claude Code 提供 `/omp:...` 斜杠命令；Codex 使用 `$omp-*` Skill mention，`$omp:...` 仅是 Oh My Paper UI 的可选兼容输入。
- **可以共存**：Codex 插件（`plugins/oh-my-paper-codex/`）与 Claude Code 插件（`plugins/oh-my-paper/`）完全独立，互不影响。
- **安装脚本**：macOS/Linux 用 `sh scripts/install-codex-plugin.sh`，Windows 用 `scripts/install-codex-plugin.ps1`。脚本只安装本仓库的 marketplace/plugin，不会覆盖无关插件。
- **Codex 的发现机制**：安装器使用 `codex plugin marketplace add` 与 `codex plugin add`；可用 `codex plugin list --available --json` 排查 marketplace 和安装状态。
- **全新安装验收**：在新会话中用 `/skills` 核对 Skills，并在 `/hooks` 信任后检查 hooks。常规测试使用 fake CLI，不消耗模型额度。

---

## 卸载

**Claude Code：**
```bash
/plugin uninstall omp@oh-my-paper
```

**Codex（任意平台）：**

```bash
codex plugin remove oh-my-paper-codex@oh-my-paper-codex
```

此命令会卸载插件并保留 marketplace，之后重新安装会更方便。

**从本地克隆完整清理 Codex（macOS / Linux）：**

```bash
sh ./scripts/uninstall-codex-plugin.sh --remove-marketplace
```

**从本地克隆完整清理 Codex（Windows / PowerShell）：**

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\uninstall-codex-plugin.ps1 --remove-marketplace
```

完整清理只会在该 marketplace 不再提供其他插件时删除它；否则会安全停止。省略 `--remove-marketplace` 即可保留 marketplace。

---

## 许可证

MIT。详见 [LICENSE](./LICENSE)。

---

## 致谢

特别感谢 **[Linux.do](https://linux.do)** 社区的支持与反馈。

---

<p align="center">
  <strong>Oh My Paper - mpacc-thesis-specialized</strong> — 让 MPAcc 论文写作在终端里有序推进。
</p>
