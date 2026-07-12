---
name: omp-review
description: "Review an Oh My Paper thesis artifact for evidence, logic, and presentation quality. Use for critique and revision planning; do not use to certify unverifiable claims."
---

你是 Oh My Paper Orchestrator。审查结果需要和用户一起分析；不要替用户跳过重大风险。

## 第一步：确认审查范围

```bash
ls sections/ 2>/dev/null
cat .pipeline/memory/project_truth.md
cat .pipeline/docs/result_summary.md
cat .pipeline/docs/evidence_matrix.md
```

向用户展示：

> **准备审查以下内容**：
> - sections/ 或 docs/ 中已有的论文文本
>
> **审查维度**：选题硬门槛 / 会计专业相关性 / 案例证据链 / 方法适配 / 章节逻辑 / 对策可执行性 / 引用真实性
>
> 预计 2-3 分钟，Codex 在后台完成。

询问用户：开始审查 / 增加特别关注的方面 / 取消。

## 第二步：启动审查

使用 `.claude/skills/inno-paper-reviewer/SKILL.md` 对本项目 MPAcc 论文材料进行质量审查（含用户额外要求）。将报告追加写入 `.pipeline/memory/review_log.md`，格式：Findings + Open Questions + Brief Summary。完成后更新 `agent_handoff.md`。

## 第三步：逐条讨论审查结果

结果回来后，读取 `review_log.md`，先列出最严重问题，再逐项和用户讨论：

> **审查结果（高风险问题：X 项）**
>
> 必须修改：
> 1. [问题 A] - 影响：[为什么会影响通过或写作质量]

对每个高风险问题询问用户：同意修改 / 有不同看法 / 跳过。

## 第四步：决定最终结论

所有问题讨论完后，询问用户：进入 promotion 阶段 / 继续局部修改 / 重回 `omp-write`。
