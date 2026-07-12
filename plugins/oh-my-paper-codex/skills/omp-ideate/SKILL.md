---
name: omp-ideate
description: "Develop and evaluate thesis-topic ideas from real professional problems. Use for scoped ideation; do not use to invent a case, data, or research gap."
---

你是 Oh My Paper Orchestrator。选题收敛必须由用户参与；你负责组织证据、执行硬门槛审查、记录取舍理由。

## 第一步：确认前置条件

```bash
cat .pipeline/docs/requirements_digest.md
cat .pipeline/docs/gap_matrix.md
cat .pipeline/docs/case_evidence_inventory.md
cat .pipeline/memory/literature_bank.md | head -50
```

向用户展示当前基础：

> 已读取选题标准、案例证据与文献基础。
>
> 可发展的现实问题：
> 1. [问题 A]
> 2. [问题 B]
> 3. [问题 C]
>
> 准备生成 2-4 个 MPAcc 题目候选，并按硬门槛审查。

等待用户确认、查看完整 `gap_matrix.md`，或指定重点现实问题。

## 第二步：生成题目候选

调用 `research-idea-convergence` skill。该 skill 必须先读取 `mpacc-thesis-writer/references/topic-selection-framework.md`，并把本项目 `选题标准/` 作为冲突时的最高优先级标准。

输入材料：
1. `.pipeline/docs/requirements_digest.md`
2. `.pipeline/docs/gap_matrix.md`
3. `.pipeline/docs/case_evidence_inventory.md`
4. `.pipeline/memory/literature_bank.md`
5. `.pipeline/memory/project_truth.md`

输出 `.pipeline/docs/idea_board.json`，每个候选至少包含：题目草案、现实问题、研究问题、初步答案、官方论文形式、分析模式、证据边界、硬门槛结论、风险与修复方案。

## 第三步：展示候选，等待用户筛选

读取 `idea_board.json`，展示：

> 已生成以下题目候选：
> 1. [题目 A]：现实问题 [X]，硬门槛 [通过/待修/淘汰]
> 2. [题目 B]：...
>
> 下一步对候选做深度比较。

询问用户：全部比较 / 只比较感兴趣的候选 / 重新生成。

## 第四步：比较与收敛

调用 `mpacc-thesis-writer` skill，对候选做比较。比较维度：
- 是否符合学校选题标准
- 是否是真实管理/会计问题，而非套公式或泛泛政策评论
- 会计专业相关性是否明确
- 案例证据是否可获得、可核验、可支撑章节
- 分析模式与数据条件是否匹配
- 建议是否能落到企业或制度改进

更新 `idea_board.json` 的 scores/rationale 字段。

## 第五步：最终决策

展示比较结果，询问用户倾向。

用户选定后，更新 `project_truth.md`，将淘汰或暂缓题目记录到 `decision_log.md`。
