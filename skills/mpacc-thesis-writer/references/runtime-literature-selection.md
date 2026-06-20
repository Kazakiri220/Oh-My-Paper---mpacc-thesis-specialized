# Runtime Literature Selection

This skill does not contain reusable citations. Only use literature the user provides for the current thesis.

## Literature Matrix Fields

Use or generate a matrix with:

`编号 / 作者 / 年份 / 题名 / 研究主题 / 研究对象 / 研究方法 / 核心观点 / 关键结论 / 适合章节 / 可支持论点 / 相关性评分 / 权威性评分 / 新近性评分 / 是否核心引用`

Run:

```bash
python scripts/build_literature_matrix.py references.txt --output literature_matrix.csv --topic-keywords "预算,风险,大数据"
```

## Stratification

- Core literature: 8-15 items; theory, framework, key method, and central claims.
- Supporting literature: 15-25 items; background, indicators, methods, and recommendations.
- Background literature: policy/industry/context claims.
- Weakly related: keep in matrix but usually do not cite.
- Excluded: out of scope, outdated without historical value, or unsupported source.

## Citation Plan By Chapter

- Chapter 1: background, significance, research status.
- Chapter 2: concepts, theories, literature synthesis.
- Chapter 3: case status; use fewer citations, mostly official documents and case data.
- Chapter 4: diagnostic framework, indicators, problem evidence.
- Chapter 5: optimization path, model, effect evaluation, safeguards.
- Chapter 6: avoid adding many new citations.

## Citation Integrity

- Cite only user-provided literature and supplied case materials.
- Do not cite a source to support a claim it does not contain.
- Use `scripts/check_citations.py` after drafting.

Good: "Use the supplied annual report for revenue data and the supplied journal article for the risk-warning indicator method."

Weak: "Add several well-known papers later to make the paragraph look academic."
