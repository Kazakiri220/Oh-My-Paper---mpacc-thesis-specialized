---
description: 将 MPAcc 论文子任务委派给 Codex：先确认任务，再三选一执行模式（前台手动·不监听 / 前台手动·挂 shell 监听 / 后台无感 codex exec），结果落 agent_handoff.md
---

> **必须使用 AskUserQuestion 工具进行所有确认步骤，不得用纯文字替代。**

你是 Oh My Paper MPAcc 论文项目的 Orchestrator。此命令用于把材料整理、证据核查、章节草拟、引用审查等子任务委派给 Codex。

## 第一步：读取上下文

```bash
cat .pipeline/memory/project_truth.md
cat .pipeline/memory/agent_handoff.md
cat .pipeline/memory/decision_log.md
cat .pipeline/docs/research_brief.json
```

## 第二步：展示计划，等待确认

用 `AskUserQuestion` 展示将委派的任务摘要：

- **任务内容**：1-2 句话描述交给 Codex 做什么
- **注入的上下文**：将附带哪些背景信息（项目主题、哪些方向被否决等）
- **输出文件**：结果写入 `.pipeline/memory/agent_handoff.md`

选项：
- `确认，进入模式选择`
- `我来调整任务描述`
- `取消`

## 第三步：构建带上下文的 prompt（仅在确认后）

按以下格式拼装完整 prompt（后面三种模式共用同一份 prompt）：

```
[项目背景]
论文方向/题目：（project_truth.md 前 10 行）
当前阶段：（research_brief.json 的 currentStage）

[已否决方向 - 不要重蹈]
（decision_log.md 最近 3 条，如有）

[上一步交接]
（agent_handoff.md 最近一条 Handoff 块，如有）

[你的任务]
（确认后的任务描述）

[输出要求]
完成后将结果摘要【追加】写入 .pipeline/memory/agent_handoff.md（只追加，不得覆盖或删改已有内容）。
不得编造学校要求、企业数据、访谈记录、内部材料、文献或引用；财务数字以 SEC 原文为准。
不得读取 `选题/微调前（AI禁止阅读）` 目录。只使用相对路径。
全部完成后，在 agent_handoff.md 文件末尾【单独追加一行】：<!-- CODEX_DONE -->
```

## 第四步：选择执行模式

用 `AskUserQuestion` 让用户三选一（**按此顺序，第一项为默认**）：

- `前台手动·不监听（默认）` — 你在自己的终端跑 Codex，跑完口头告诉我，我再读结果。我全程不挂后台。
- `前台手动·挂 shell 监听` — 你在自己的终端跑 Codex，我起一个后台 watcher 盯着完成标记，一出现就自动接力。
- `后台无感（codex exec）` — 我直接在后台用 `codex exec`（沙箱限定只写项目内）跑，跑完拿到通知再汇报，你不用动手。

按所选模式执行：

### 模式 C —— 前台手动·不监听

1. 用代码块把完整命令展示给用户，让其在**新终端**执行（交互版 Codex，由你在 TUI 内逐命令把关）：
   ```
   codex "<完整 prompt>"
   ```
   （prompt 很长时，可改为先运行 `codex` 进入交互界面再粘贴。）
2. 用 `AskUserQuestion` 询问：`我跑完了` / `取消`。
3. 用户说跑完后，读取结果并汇报：
   ```bash
   tail -40 .pipeline/memory/agent_handoff.md
   ```

### 模式 B —— 前台手动·挂 shell 监听

1. **先**起后台 watcher：它先记下当前 `<!-- CODEX_DONE -->` 的**基线数量**，再轮询到数量**相对基线增加**才退出（**不设超时**）。用 Bash 工具、`run_in_background: true` 执行：
   ```bash
   base=$(grep -c "CODEX_DONE" .pipeline/memory/agent_handoff.md 2>/dev/null); base=${base:-0}
   echo "baseline CODEX_DONE = $base"
   while :; do
     cur=$(grep -c "CODEX_DONE" .pipeline/memory/agent_handoff.md 2>/dev/null); cur=${cur:-0}
     [ "$cur" -gt "$base" ] && { echo "CODEX_DONE $base -> $cur, done"; break; }
     sleep 10
   done
   ```
   > 关键：盯的是"标记数量**有没有增加**"，**不是**"存不存在"——handoff 累积追加，里面有历次旧标记，只看存在会立刻误判完成。
2. 再用代码块把完整命令展示给用户，让其在**新终端**执行：
   ```
   codex "<完整 prompt>"
   ```
3. watcher 后台退出（标记数增加 = 这次跑完）会通知你。此时读取结果并汇报：
   ```bash
   tail -40 .pipeline/memory/agent_handoff.md
   ```
   > 不设超时：若 Codex 失败、压根没写出标记，watcher 会一直挂着——需要时手动停掉或结束会话。

### 模式 A —— 后台无感（codex exec）

1. 用 Bash 工具、`run_in_background: true` 直接执行（**在项目根目录运行**；`-s workspace-write` 把写入限定在项目目录内 + 临时目录；本项目非 git 仓库，必须带 `--skip-git-repo-check`；用引号 heredoc 把 prompt 经 stdin 喂入，防止 `$`/反引号被 shell 展开、也免去转义）：
   ```bash
   codex exec -s workspace-write --skip-git-repo-check - <<'OMP_PROMPT'
   <完整 prompt>
   OMP_PROMPT
   ```
2. 进程结束后你会收到完成通知（模式 A 用**进程退出**作为完成信号，不依赖标记轮询）。检查退出码与结果：
   - 退出码非 0 → 报告失败，贴出 Codex 输出关键行；
   - 正常 → `tail -40 .pipeline/memory/agent_handoff.md` 后汇报。

## 第五步：收尾

向用户简要说明：做了什么、产出/改动了哪些文件、有没有问题。再用 `AskUserQuestion` 询问：
- `接受结果，继续下一步`
- `需要 Codex 修改某处`
- `这个结果有问题，放弃`

---

> **注意事项（铁律）**
> - **沙箱**：仅模式 A 强制 `-s workspace-write`（写入限项目内）；模式 B/C 是你手动跑的交互版 Codex，由你在 TUI 内把关。任何模式都**绝不**使用 `danger-full-access` / `--dangerously-bypass-approvals-and-sandbox`。
> - **OneDrive**：项目在同步目录，**一次只委派一个任务**，避免与同步或其它写入抢同一文件。
> - **agent_handoff.md 只追加**：任何模式都不得覆盖既有内容。
