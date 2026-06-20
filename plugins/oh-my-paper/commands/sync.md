---
description: 强制同步 MPAcc 论文项目进度文档（project_truth / execution_context / orchestrator_state）
---

你是 Oh My Paper Conductor。用户调用此命令是因为进度文档没有及时更新。你的任务是**全面重建三个核心进度文档**，使其准确反映当前真实状态。

## 第一步：读取所有原始数据

一次性读取所有状态文件，获取完整上下文：

```bash
cat .pipeline/tasks/tasks.json
cat .pipeline/memory/project_truth.md
cat .pipeline/memory/orchestrator_state.md
cat .pipeline/memory/execution_context.md
cat .pipeline/memory/decision_log.md
cat .pipeline/memory/literature_bank.md
cat .pipeline/memory/evidence_ledger.md
cat .pipeline/memory/agent_handoff.md
cat .pipeline/memory/review_log.md
cat .pipeline/docs/research_brief.json
cat .pipeline/docs/evidence_matrix.md
cat .pipeline/docs/method_data_fit.md
```

## 第二步：向用户确认遗漏的进展

用 `AskUserQuestion` 询问：

> **进度同步**
>
> 我已读取所有文件，准备重建进度文档。
>
> 请简述一下**文档中没有记录但实际已完成的事情**（如果有）：
> - 例：“导师确认了题目，要求聚焦 X 公司内部控制问题”
> - 例：“补充了 2024 年年报和交易所问询函”
> - 例：“没有遗漏，只是文档没更新”

选项：
- `没有遗漏，直接从现有文件同步`
- `有遗漏，我来描述`

如果用户选“有遗漏”，用纯文字追问具体内容，收集后再继续。

## 第三步：重建 project_truth.md

综合所有信息，**完整重写** `project_truth.md`，结构如下：

```markdown
# Project Truth
_最后同步：[ISO 日期时间]_

## 论文方向/题目
[来自 research_brief.json 或已确认决策]

## 当前阶段
[currentStage] - 总体进度：[X/Y 任务完成]

## 选题硬门槛
[学校/学院标准、MPAcc 专业适配要求、导师明确意见]

## 研究问题与初步答案
- 研究问题：[可观察现象 + 关键因素 + 后果]
- 初步答案：[当前可支持的解释或判断]

## 案例对象与证据边界
- 案例对象：[企业/行业/制度场景]
- 已获得证据：[路径或来源]
- 可公开获取证据：[来源]
- 需用户补充：[材料]
- 不可得证据：[不得继续依赖的材料]

## 已确认决策
（来自 decision_log.md，每条一行，格式：[日期] 决策内容）

## 阶段进展摘要

### Survey
[选题标准、案例材料、文献调研成果]

### Ideation
[候选题目、淘汰理由、选定题目]

### Experiment
[证据矩阵、方法适配、可写性结论]

### Publication
[开题、综述、提纲、章节写作进展]

## 风险 / 阻塞项
[当前阻塞或高风险项]
```

## 第四步：重建 orchestrator_state.md

**完整重写** `orchestrator_state.md`：

```markdown
# Orchestrator State
_最后同步：[ISO 日期时间]_

## 全局进度看板

| 阶段 | 状态 | 完成/总计 | 备注 |
|------|------|----------|------|
| Survey | [done/active/pending] | X/Y | 选题标准、案例材料、文献 |
| Ideation | [done/active/pending] | X/Y | 题目候选与硬门槛审查 |
| Experiment | [done/active/pending] | X/Y | 证据矩阵与方法适配 |
| Publication | [done/active/pending] | X/Y | 开题、综述、正文、引用 |
| Promotion | [done/active/pending] | X/Y | 答辩材料 |

## 当前活跃任务
[列出 tasks.json 中所有 status=in-progress 的任务]

## 最近完成任务（最近5条）
[tasks.json 中最近 done 的任务，含 updatedAt]

## 决策点
[需要 Conductor 做决定的事项，来自 agent_handoff.md 或 review_log.md]

## 下一步建议
[基于当前状态，最合理的下一步行动]
```

## 第五步：重建 execution_context.md

**完整重写** `execution_context.md`：

```markdown
# Execution Context
_最后同步：[ISO 日期时间]_

## 当前任务

**ID:** [当前 in-progress 任务 ID，无则填“待分配”]
**标题:** [任务标题]
**状态:** [in-progress / 待分配]
**详细说明:**
[任务要求]

## 任务证据边界
[本任务可使用的材料、不可使用的材料、需用户补充的材料]

## 方法与章节关系
[本任务产出将支撑哪些章节或质量门槛]

## 上下文积累诊断
[本任务已积累的关键上下文，帮助执行者避免重复劳动]

## 待处理的 Agent 反馈
[来自 agent_handoff.md 中还未处理的交接项]
```

## 第六步：写入文件并确认

将上述三个文件用 Write/Edit 工具直接写入 `.pipeline/memory/`。

写完后，用 `AskUserQuestion` 确认：

> **同步完成**
>
> 已更新：
> - `project_truth.md` - 题目、选题门槛、案例证据边界
> - `orchestrator_state.md` - 全局进度看板 + 决策点
> - `execution_context.md` - 当前任务 + 证据边界 + 章节关系
>
> 接下来？

选项：
- `继续当前任务`
- `查看更新后的进度（/omp:plan）`
- `没事了`
