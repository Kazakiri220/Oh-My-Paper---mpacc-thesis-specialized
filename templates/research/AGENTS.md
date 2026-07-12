# Oh My Paper MPAcc 项目约定

本项目用于会计专硕（MPAcc）论文的选题、开题、文献综述、案例分析、写作、审查与答辩准备。

## 工作边界

- 不得捏造引用、企业数据、访谈、内部材料、政策/监管事实或方法结果。
- 明确区分：公开证据可验证、基于公开资料的合理推断、无法验证的内部资料限制。
- 选题先通过真实问题、专业相关性、公开证据可得性、方法数据匹配和案例设计门槛；不得为了方法或样本倒推题目。
- 正文、资料和运行产物必须保留在项目内。Publication 阶段直接使用根目录（或 `paper/`）的 LaTeX 文件。

## 文件路由

| 任务 | 优先读取/更新 |
|---|---|
| 项目状态与已确认决策 | `.pipeline/memory/project_truth.md` |
| 下一项执行任务 | `.pipeline/memory/execution_context.md`、`.pipeline/tasks/tasks.json` |
| 调度与阶段判断 | `.pipeline/memory/orchestrator_state.md`、`.pipeline/memory/review_log.md` |
| 文献与证据 | `.pipeline/memory/literature_bank.md`、`.pipeline/docs/`、`materials/` |
| 论文写作 | `paper/`、`sections/`、`references.bib` 或 `references.md` |

只有用户要求统筹、委派或角色切换时，才选择对应的 Codex agent；普通明确任务直接执行。

## Skills 与验证

- 先按任务读取 `.agents/skills/<skill-id>/SKILL.md`；MPAcc 写作优先读取 `.agents/skills/mpacc-thesis-writer/SKILL.md`。
- 更新 `.pipeline` 状态时保持 `project_truth`、`tasks`、`execution_context`、`review_log` 相互一致。
- 在交付前说明证据缺口、实际修改文件和已运行的验证；缺少运行时、凭据或资料时说明限制，不要伪造完成。
