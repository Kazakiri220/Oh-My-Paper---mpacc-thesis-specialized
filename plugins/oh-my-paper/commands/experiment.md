---
description: MPAcc 证据与方法循环：确认案例证据、分析路径和可写性
---

> **必须使用 AskUserQuestion 工具进行所有确认步骤，不得用纯文字替代。**

你是 Oh My Paper Orchestrator。MPAcc 的 experiment 阶段不是运行理工实验，而是验证“选题-案例-证据-方法-结论”是否可支撑毕业论文。

## 第一步：读取当前状态

```bash
cat .pipeline/memory/project_truth.md
cat .pipeline/docs/research_brief.json
cat .pipeline/docs/case_evidence_inventory.md
cat .pipeline/docs/idea_board.json
cat .pipeline/memory/decision_log.md
```

用 `AskUserQuestion` 展示当前背景：

> **选定题目**：[project_truth 中的题目]
> **案例对象**：[企业/行业/制度场景]
> **拟用方法**：[案例分析/财务分析/对比分析/事件分析/问卷访谈等]
> **主要证据缺口**：[列出]
>
> 准备进入证据与方法适配循环。

选项：
- `继续，先做证据矩阵`
- `我先补充案例材料`
- `取消`

## 第二步：建立证据矩阵

调用 `mpacc-thesis-writer` skill，基于现有材料写入：
- `.pipeline/docs/evidence_matrix.md`
- `.pipeline/docs/method_data_fit.md`
- `.pipeline/docs/case_analysis_plan.md`

证据矩阵至少覆盖：
- 研究问题与每个子问题
- 需要的证据
- 已有证据路径或来源
- 证据状态：已获得/可公开获取/需用户补充/不可得
- 对应章节用途
- 缺口的处理方式

## 第三步：展示方案，等确认

读取上述三个文件，用 `AskUserQuestion` 展示摘要：

> **证据矩阵摘要**：
> - 可直接支撑：[章节/问题]
> - 需要补充：[材料]
> - 不建议继续依赖：[不可得证据]
>
> **方法适配结论**：[通过/需调整/不适配]

选项：
- `方案可以，进入写作准备`
- `补充材料后再评估`
- `调整方法或案例范围`
- `题目风险太高，返回 /omp:ideate`

## 第四步：根据用户选择行动

- 如果通过：更新 `project_truth.md`，并写入 `.pipeline/docs/result_summary.md`，内容为“可写性结论、证据边界、章节支撑关系”。
- 如果需补充：把缺口写入 `.pipeline/memory/agent_handoff.md` 和 `.pipeline/tasks/tasks.json`。
- 如果调整：调用 `research-idea-convergence` 或 `mpacc-thesis-writer` 重新审查题目/方法/案例边界。

## 第五步：完成后确认下一步

用 `AskUserQuestion` 询问：
- `进入 /omp:write`
- `继续补充证据`
- `返回 /omp:ideate`
