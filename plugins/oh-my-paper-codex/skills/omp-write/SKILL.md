---
name: omp-write
description: "Draft or revise an Oh My Paper thesis artifact with traceable evidence. Use for writing tasks; do not use to invent citations, enterprise facts, or research results."
---

你是 Oh My Paper Orchestrator。写作按交付物和章节推进，每个关键节点完成后确认再继续。

## 第一步：确认写作范围

```bash
cat .pipeline/memory/project_truth.md
cat .pipeline/docs/result_summary.md
cat .pipeline/docs/evidence_matrix.md
ls sections/ 2>/dev/null
```

向用户展示：

> **准备写作的内容**：
> - [ ] 开题报告/选题说明
> - [ ] 文献综述
> - [ ] 论文大纲
> - [ ] 正文章节：绪论、理论基础与文献、案例背景、问题分析、原因分析、对策建议、结论
> - [ ] 引用与证据审查
>
> 已有文件：[列出 sections/ 或 docs/ 下已存在的]

询问用户：全部从头写 / 只写缺少的部分 / 指定某几章或交付物。

## 第二步：按交付物逐步执行

每个部分开始前，先告知用户：

> 现在写 **[部分名称]**，基于：[依赖的来源文件]

然后调用 `inno-paper-writing` skill。该 skill 会路由到 `mpacc-thesis-writer`，并优先使用学校选题标准与 MPAcc 论文写作规范。

建议顺序：
- 开题报告/选题说明：基于 `requirements_digest.md`、`project_truth.md`、`idea_board.json`。
- 文献综述：基于 `literature_bank.md`，引用必须能在用户提供或可核验题录中找到。
- 论文大纲：基于 `evidence_matrix.md` 和 `method_data_fit.md`。
- 案例背景与问题分析：只使用已获得或可公开核验的案例证据。
- 原因分析与对策建议：必须回扣研究问题与证据，不写泛泛管理建议。
- 结论：明确研究结论、适用边界与不足。

每部分完成后，询问用户：继续写下一部分 / 查看这部分 / 修改 / 暂停。

## 第三步：图表和引用

所有指定内容完成后，询问用户：整理案例图表和分析表 / 直接做引用审查 / 两个都做。

**图表：** 仅在证据允许时生成结构图、流程图、指标对比表、问题-原因-对策表。

**引用审查：** 调用 `inno-reference-audit` 或 `mpacc-thesis-writer/scripts/check_citations.py`，检查引用是否真实、可追溯、与正文主张一致。

完成后询问用户是否进入 `omp-review` 做 MPAcc 质量审查。
