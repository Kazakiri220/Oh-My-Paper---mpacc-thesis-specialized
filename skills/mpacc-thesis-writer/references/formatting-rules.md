# Formatting Rules

User-provided school requirements override all defaults.

## Defaults To Confirm

- Word count: ask the user; common MPAcc theses vary widely and should not default to 60,000 words.
- Numbering system:
  - A: `一、` -> `（一）` -> `1.` -> `（1）`
  - B: `1` -> `1.1` -> `1.1.1`
- Abstract: Chinese and English, usually 300-500 Chinese characters/words each unless school rules differ.
- References: GB/T 7714-2015, often sequential coding.
- Figures: title below, numbered by chapter such as `图 3-1`.
- Tables: title above, numbered by chapter such as `表 4-2`.

## Citation Defaults

- Use in-text numeric citations such as `[1]` if the school requires sequential coding.
- Keep reference list order consistent with first citation order.
- Run `scripts/check_citations.py` after drafting.

## File Organization

When writing files:

- `outline.md`
- `literature_matrix.csv`
- `citation_plan.md`
- `ch1_introduction.md` through `ch6_conclusion.md`
- `project-state.md`

Good: "Apply school template first, then adapt this skill's structure."

Weak: "Use a generic thesis format because MPAcc theses are similar."
