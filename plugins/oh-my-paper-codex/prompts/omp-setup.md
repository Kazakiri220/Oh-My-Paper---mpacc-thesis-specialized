---
description: 初始化 MPAcc 论文项目结构（.pipeline/），并检查 Codex 插件是否就绪
---

你正在为当前目录初始化 Oh My Paper MPAcc 论文 harness。

## 第一步：检查 Codex 插件

```bash
node -e "process.exit(0)" 2>/dev/null && echo "Node.js OK"
which codex 2>/dev/null && codex --version 2>/dev/null || echo "Codex not found"
```

向用户告知环境状态：
- Node.js：[OK / 未安装]
- Codex CLI：[版本 / 未安装]

如未安装，提示：`/plugin install codex@openai-codex` 然后 `/reload-plugins`。

## 第二步：询问论文信息

向用户收集：
- 学校或学院要求是否已提供
- 初步方向、案例企业或行业
- 当前最担心的是选题、材料、方法还是写作

询问从哪个阶段开始：
- survey（选题标准、案例材料、文献调研）
- ideation（MPAcc 选题收敛）
- experiment（证据与方法适配）
- publication（开题、综述、正文写作）

## 第三步：创建目录结构

```bash
mkdir -p .pipeline/memory .pipeline/tasks .pipeline/docs .pipeline/.hook-events .claude/skills materials sections
cp -rn "${CLAUDE_PLUGIN_ROOT}/skills/." .claude/skills/
```

注册 SessionStart hook：

```bash
node -e "
const fs = require('fs');
const path = require('path');
const f = path.join('.claude', 'settings.json');
const s = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f,'utf8')) : {};
if (!s.hooks) s.hooks = {};
if (!s.hooks.SessionStart) s.hooks.SessionStart = [];
const cmd = 'node \"\${CLAUDE_PLUGIN_ROOT}/scripts/on-session-start.mjs\"';
const already = s.hooks.SessionStart.some(h =>
  Array.isArray(h.hooks) && h.hooks.some(hh => (hh.command||'').includes('on-session-start'))
);
if (!already) {
  s.hooks.SessionStart.push({ matcher: '', hooks: [{ type: 'command', command: cmd }] });
  fs.mkdirSync('.claude', { recursive: true });
  fs.writeFileSync(f, JSON.stringify(s, null, 2));
  console.log('hook registered');
} else { console.log('hook already registered'); }
"
```

## 第四步：写入初始文件

创建以下文件（已存在则跳过）：

**`.pipeline/docs/research_brief.json`**：
```json
{
  "topic": "[用户填写的方向或题目]",
  "schoolRequirements": "",
  "caseObject": "",
  "researchQuestion": "",
  "provisionalAnswer": "",
  "officialThesisForm": "",
  "analysisPattern": "",
  "currentStage": "[用户选择的阶段]",
  "evidenceBoundary": {
    "available": [],
    "publiclyAccessible": [],
    "needsUserInput": [],
    "unavailable": []
  }
}
```

**`.pipeline/memory/project_truth.md`**：
```markdown
# Project Truth

## 论文方向
[方向或题目]

## 选题硬门槛
（学校/学院标准、MPAcc 适配要求，随项目推进补充）

## 案例对象与证据边界
（企业/行业/制度场景、已获得材料、需补充材料）

## 已确认决策
（空，随项目推进逐步填充）
```

**`.pipeline/memory/orchestrator_state.md`**、**`execution_context.md`**、**`review_log.md`**、**`agent_handoff.md`**、**`decision_log.md`**、**`literature_bank.md`**、**`evidence_ledger.md`**：均创建空白初始版本。

**`.pipeline/tasks/tasks.json`**：
```json
{"version": 1, "tasks": []}
```

完成后提示用户运行 `omp-plan` 或 `omp-survey`。
