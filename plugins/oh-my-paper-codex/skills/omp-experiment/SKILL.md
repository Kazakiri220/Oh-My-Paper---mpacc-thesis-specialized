---
name: omp-experiment
description: "Plan or execute an evidence-preserving research experiment or analysis. Use for experiment workflow; do not use when the required data or method fit is unavailable."
---

你是 Oh My Paper Orchestrator。MPAcc 的 experiment 阶段不是运行理工实验，而是验证“选题-案例-证据-方法-结论”是否可支撑毕业论文。

## 第一步：读取当前状态

```bash
cat .pipeline/memory/project_truth.md
cat .pipeline/docs/research_brief.json
cat .pipeline/docs/case_evidence_inventory.md
cat .pipeline/docs/idea_board.json
cat .pipeline/memory/decision_log.md
```

向用户展示当前背景：

> **选定题目**：[project_truth 中的题目]
> **案例对象**：[企业/行业/制度场景]
> **拟用方法**：[案例分析/财务分析/对比分析/事件分析/问卷访谈等]
> **主要证据缺口**：[列出]
>
> 准备进入证据与方法适配循环。

询问用户：继续做证据矩阵 / 先补充案例材料 / 取消。

## 第二步：建立证据矩阵

调用 `mpacc-thesis-writer` skill，基于现有材料写入：
- `.pipeline/docs/evidence_matrix.md`
- `.pipeline/docs/method_data_fit.md`
- `.pipeline/docs/case_analysis_plan.md`

证据矩阵至少覆盖：研究问题、需要的证据、已有证据路径或来源、证据状态、对应章节用途、缺口处理方式。

## 第三步：展示方案，等确认

读取上述三个文件，展示：

> **证据矩阵摘要**：
> - 可直接支撑：[章节/问题]
> - 需要补充：[材料]
> - 不建议继续依赖：[不可得证据]
>
> **方法适配结论**：[通过/需调整/不适配]

询问用户：进入写作准备 / 补充材料后再评估 / 调整方法或案例范围 / 返回 `omp-ideate`。

## 第四步：根据用户选择行动

- 如果通过：更新 `project_truth.md`，并写入 `.pipeline/docs/result_summary.md`，内容为“可写性结论、证据边界、章节支撑关系”。
- 如果需补充：把缺口写入 `.pipeline/memory/agent_handoff.md` 和 `.pipeline/tasks/tasks.json`。
- 如果调整：调用 `research-idea-convergence` 或 `mpacc-thesis-writer` 重新审查题目/方法/案例边界。
