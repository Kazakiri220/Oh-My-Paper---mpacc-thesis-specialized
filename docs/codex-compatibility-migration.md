# Codex 兼容改造实施说明

> 状态：实现完成，自动化验证已覆盖 P0-P2；真实 Codex 全局安装 smoke 与完整 Rust 套件待具备执行权限的环境复跑。
>
> 编写日期：2026-07-11
>
> 用途：供新的 Codex 会话或其他模型直接接手实施。实施者应先阅读全文，再从 P0 开始；不要跳阶段。

## 1. 目标

把 Oh My Paper 改造成真正兼容 Codex 的 MPAcc 论文工作台，而不只是包含若干以 Codex 命名的文件。

完成后应同时支持：

1. 在 Oh My Paper 桌面应用中选择 Codex Provider，正常发送消息、流式显示结果、执行项目内文件修改并恢复会话。
2. 在原生 Codex CLI、IDE 或桌面端中安装并启用 Oh My Paper 插件。
3. 在论文项目中通过 `$omp-sync`、`$omp-plan` 等 Skill 运行完整工作流。
4. Codex 能发现项目级 `AGENTS.md`、`.agents/skills/`、`.codex/agents/*.toml` 和 `.codex/hooks.json`。
5. Claude Code 现有功能不因 Codex 改造而回归。

这不是模型 API 接入项目。首选复用用户已经安装并登录的 Codex CLI。

## 2. 最终用户体验

用户安装插件或由 Oh My Paper 创建论文项目后，可以在项目目录启动 Codex，然后输入：

```text
$omp-sync
$omp-plan
$omp-survey
$omp-ideate
$omp-experiment
$omp-write
$omp-review
$omp-delegate
```

也可以附加具体要求：

```text
$omp-sync 检查 project_truth、tasks、evidence_matrix 和 execution_context 是否一致
```

Codex 还应能根据自然语言隐式选择对应 Skill，例如：

```text
同步当前论文项目的进度文档，并告诉我下一项最合理的任务。
```

### 2.1 命令命名约定

Codex 的标准入口使用 Skill mention，主命名统一为连字符形式：

| 兼容旧写法 | Codex 标准写法 | Skill 名称 |
|---|---|---|
| `$omp:setup` | `$omp-setup` | `omp-setup` |
| `$omp:plan` | `$omp-plan` | `omp-plan` |
| `$omp:survey` | `$omp-survey` | `omp-survey` |
| `$omp:ideate` | `$omp-ideate` | `omp-ideate` |
| `$omp:experiment` | `$omp-experiment` | `omp-experiment` |
| `$omp:write` | `$omp-write` | `omp-write` |
| `$omp:review` | `$omp-review` | `omp-review` |
| `$omp:sync` | `$omp-sync` | `omp-sync` |
| `$omp:delegate` | `$omp-delegate` | `omp-delegate` |

原生 Codex 不应依赖冒号形式。Oh My Paper 自己的聊天输入层可以将完整匹配的 `$omp:<name>` 兼容转换为 `$omp-<name>`，但不得改写代码块、文件内容或普通文本中的相似字符串。

## 3. 当前基线与已确认问题

分析时本机 Codex CLI 为 `codex-cli 0.144.0`。实现不得只针对这个版本硬编码，应通过稳定子命令和宽容事件解析保持向后兼容。

### 3.1 嵌入式 Codex CLI 调用已失效

涉及文件：

- `src-tauri/src/services/cli_agent.rs`
- `src-tauri/src/services/agent.rs`
- `src-tauri/src/models.rs`
- `sidecar/utils/dispatch-agent.mjs`
- `skills/codex-dispatch/SKILL.md`
- `src-tauri/resources/skills/codex-dispatch/SKILL.md`

迁移前 Rust 路径调用（历史错误示例，不得使用）：

```text
codex -p <message> --full-auto
```

在当前 Codex 中，`-p` 表示 profile，不表示 prompt。非交互自动化入口应使用 `codex exec`。当前程序也没有启用 `--json`，却把 stdout 当成自定义 `StreamChunk` JSON 解析。

Codex JSONL 事件使用 `thread.started`、`turn.started`、`item.started`、`item.completed`、`turn.completed`、`turn.failed`、`error` 等类型，与当前 `text_delta`、`tool_call_start` 协议不同。

此外：

- UI 选择的 Codex model 和 reasoning effort 没有完整传给 CLI。
- Rust 直接使用 `Command::new("codex")`，没有复用现有 CLI 发现逻辑。
- Windows 常见安装实际暴露 `codex.cmd`/`codex.ps1`，必须专项测试。
- 恢复会话应使用 `codex exec resume <SESSION_ID>`，不能套用 Claude 的 `--resume` 参数。

### 3.2 Codex 插件只能被发现，能力没有正确打包

涉及文件：

- `.agents/plugins/marketplace.json`
- `plugins/oh-my-paper-codex/.codex-plugin/plugin.json`
- `plugins/oh-my-paper-codex/skills`
- `plugins/oh-my-paper-codex/prompts/`
- `plugins/oh-my-paper-codex/agents/`
- `plugins/oh-my-paper-codex/scripts/`
- `scripts/manage-codex-plugin.mjs`

已存在的 marketplace 和 manifest 是可复用基础，但当前 `plugins/oh-my-paper-codex/skills` 是一个内容为 `../../skills` 的普通文件，不是目录或 Git symlink。全新安装时 manifest 的 `"skills": "./skills/"` 无法提供任何 Skill。

Codex 官方插件组件包括 `skills/`、`hooks/`、`.mcp.json`、`.app.json` 和 `assets/`。当前插件根目录的 `prompts/` 和 `agents/` 不应假定会被插件系统自动加载。

当前安装管理器通过实验性 `codex app-server` 尝试安装；在 Windows 诊断中出现过 `spawn EINVAL`。当前稳定 CLI 已提供 `codex plugin marketplace ...`、`codex plugin add`、`codex plugin list` 和 `codex plugin remove`。

### 3.3 项目脚手架把不同运行时的格式混在一起

涉及文件：

- `src-tauri/src/services/research.rs`
- `templates/research/AGENTS.md`
- `templates/research/CLAUDE.md`
- `templates/harness/`

`write_harness_files()` 当前把同一套 commands、agents 和 hooks 复制到 `.claude/`、`.agents/`、`.codex/`。文件存在不代表 Codex 会识别：

- Codex 项目 Skills 应在 `.agents/skills/<skill>/SKILL.md`。
- Codex 自定义代理应在 `.codex/agents/*.toml`。
- Codex 项目 hooks 应在 `.codex/hooks.json` 或 `.codex/config.toml`。
- `.codex/commands/*.md` 和 `.codex/agents/*.md` 不应作为主要兼容机制。
- `.agents/settings.json` 中的 Claude permissions/hooks 格式不是 Codex 项目配置。

### 3.4 核心 MPAcc Skill 打包漂移

根目录 `skills/mpacc-thesis-writer/` 存在，`templates/research/AGENTS.md` 也要求优先读取它，但 `src-tauri/resources/skills/` 中没有该目录，资源版 `research-scope.json` 也没有该条目。因此生成项目可能引用一个没有实际复制进去的核心 Skill。

`npm run skills:research:check` 当前还依赖工作区之外的 `dr-claw` 源仓库；在没有 `DR_CLAW_ROOT` 时无法作为全新克隆的可重复 CI 检查。

### 3.5 文档与当前 Codex 能力不一致

`README.zh.md` 和英文 README 仍声称 Codex 没有原生 hook 系统。当前 Codex 已支持项目 hooks 和插件 bundled hooks，此说明需要在功能完成后更新。

## 4. 不可违反的约束

1. 不得覆盖或回滚用户已有修改。分析时工作区已有：`LICENSE` 删除、`README.zh.md` 修改、`new 2.txt` 未跟踪；实施前必须重新检查，不得假定状态不变。
2. 不得使用 `git reset --hard`、`git checkout --` 或等效破坏性操作。
3. 不得为了自动化而使用 `danger-full-access` 或 `--dangerously-bypass-approvals-and-sandbox`。
4. 默认写操作只允许 `workspace-write`；只读任务使用 `read-only`。
5. 不得把 Claude Code 的配置文件直接复制一份并改目录名作为 Codex 实现。
6. 不得删除 Claude Code 支持，除非另有明确请求。
7. 不得把真实模型调用作为单元测试前提。大部分测试必须使用 fixtures 或 fake executable。
8. 不得在日志、数据库或错误信息中记录 API key、Codex auth token 或完整认证文件内容。
9. 不得承诺原生 Codex 支持 `$omp:sync`；原生标准是 `$omp-sync`。

## 5. 目标架构

```text
repository/
├── AGENTS.md                         # 源码仓库贡献约定，保持精简
├── .agents/
│   ├── plugins/marketplace.json
│   └── skills/                       # 仅源码仓库自身需要的 repo skills（如有）
├── .codex/
│   ├── config.toml                   # 源码仓库的 Codex 项目配置（仅必要项）
│   ├── hooks.json                    # 源码仓库 hooks（如确有必要）
│   └── agents/*.toml                 # 源码开发代理（与论文项目代理分开）
├── plugins/oh-my-paper-codex/
│   ├── .codex-plugin/plugin.json
│   ├── skills/
│   │   ├── omp-setup/SKILL.md
│   │   ├── omp-plan/SKILL.md
│   │   ├── omp-sync/SKILL.md
│   │   └── ...
│   ├── hooks/hooks.json
│   ├── scripts/*.mjs
│   └── assets/
└── templates/codex-research/
    ├── AGENTS.md
    ├── config.toml
    ├── hooks.json
    └── agents/*.toml
```

论文项目生成后的关键结构：

```text
thesis-project/
├── AGENTS.md
├── .agents/skills/<skill-id>/SKILL.md
├── .codex/config.toml
├── .codex/hooks.json
├── .codex/agents/*.toml
├── .claude/...                       # 保留 Claude Code 视图
└── .pipeline/...
```

公共研究定义应有单一来源，再渲染为 Claude/Codex 各自格式。不要手工维护三套会逐渐漂移的正文。

## 6. 分阶段实施

## P0-A：跑通桌面应用的 Codex Runner

### 目标

应用中选择 Codex 后，可以开始新会话、流式接收事件、执行项目内任务、取消运行并恢复会话。

### 文件级任务

- [x] 为 Codex 建立独立进程构建逻辑，不再与 Claude 共用参数拼装。
- [x] 修改 `src-tauri/src/services/cli_agent.rs`，使用 `codex exec`。
- [x] 将已解析的 CLI 路径传入启动逻辑，补齐 Windows `.cmd` 支持。
- [x] 新增 Codex JSONL 原始事件结构及转换器；不要直接反序列化为现有 `StreamChunk`。
- [x] 修改 `src-tauri/src/services/agent.rs`，按 vendor 选择 Claude 或 Codex 流解析器。
- [x] 支持 Codex session/thread ID 持久化和 `codex exec resume`。
- [x] 传递 model 与 reasoning effort；没有用户选择时允许 Codex 使用自身默认值。
- [x] 并发消费 stdout/stderr，防止子进程管道阻塞。
- [x] 保持取消操作有效，Windows 下确认不会遗留子进程。

### 新会话命令契约

参数应以数组传递，prompt 优先通过 stdin，避免 shell 引号和长度问题。概念命令如下：

```text
codex exec --json --sandbox workspace-write -C <project-root> [-m <model>] -
```

如果调用路径已经通过 `current_dir(project_root)` 设置工作目录，可不重复 `-C`，但测试必须确认项目根识别一致。

### 恢复会话命令契约

```text
codex exec resume --json [-m <model>] <thread-id> -
```

实施者必须以当前安装版本的 `codex exec resume --help` 验证参数归属和顺序，不要凭记忆拼装。

### JSONL 映射要求

| Codex 事件 | 内部行为 |
|---|---|
| `thread.started` | 保存 `thread_id`，作为 remote session ID |
| `turn.started` | 标记本轮开始；通常不产生正文 |
| `item.started` | 创建 reasoning/tool/command/file-change 等时间线项 |
| `item.updated`（若版本提供） | 增量更新对应时间线项；未知字段必须可忽略 |
| `item.completed` + `agent_message` | 写入助手正文 |
| `item.completed` + reasoning | 写入思考/摘要展示区，遵守产品展示策略 |
| `item.completed` + command execution | 完成工具时间线项并记录安全截断后的预览 |
| `item.completed` + file change | 完成文件修改时间线项 |
| `item.completed` + MCP/web/plan | 映射为相应工具或进度事件；未知 item type 不得导致整轮失败 |
| `turn.completed` | 保存 usage 并发出 Done |
| `turn.failed` / `error` | 发出可读错误并保留已收到的部分结果 |

解析器必须满足：

- 未知事件和未知字段向前兼容。
- 单行坏 JSON 应记录诊断，不得无条件丢失整轮已接收内容。
- 同一 agent message 不得重复追加。
- tool output 必须做长度限制，完整输出不应塞入聊天正文。
- usage 缺失时允许为 0/unknown，不得伪造。

### 测试

- [x] 为新会话参数生成编写单元测试。
- [x] 为 resume 参数生成编写单元测试。
- [x] 提供 Windows `.cmd`、Unix binary 的 fake executable 测试。
- [x] 建立 `thread.started → item.* → turn.completed` JSONL fixture。
- [x] 建立 unknown event、malformed line、turn.failed fixture。
- [x] 验证模型选择和 reasoning effort 被传递。
- [x] 验证取消后进程和数据库状态被清理。

验证记录（2026-07-11）：本机 `codex-cli 0.144.0` 的 `exec resume --help` 不接受
`--sandbox` 或 `-C`，实现因此在 resume 时仅传递其支持的 `--json`、model、thread ID
和 stdin prompt，并以进程工作目录保持项目根。Rust fake CLI、JSONL fixtures、取消路径
测试均已通过；数据库没有单独的“运行中”记录，取消测试验证活动进程句柄被清除且会话数据
不会被取消逻辑删除。

## P0-B：修复所有旧 Codex 调用

- [x] 修改 `sidecar/utils/dispatch-agent.mjs`，使用 `codex exec --sandbox workspace-write -`，不再使用 `-p`。
- [x] 修改根目录和 Tauri resources 中的 `codex-dispatch/SKILL.md`。
- [x] 全仓搜索 `codex -p`、`--approval-mode full-auto`、`codex --full-auto`、`--dangerously-skip` 等旧或危险组合。
- [x] 保留明确的人类交互式 `codex "prompt"` 用法时，需要说明它不是后台自动化路径。

完成检查：

```powershell
rg -n --hidden "codex\s+(-p|--full-auto)|--approval-mode\s+full-auto" . -g '!node_modules' -g '!.git'
```

预期：不存在仍会执行的旧调用；历史迁移说明中的示例可保留但必须明确标记。

## P0-C：让 Codex 插件真正携带 Skills

### 目标

全新克隆、没有符号链接特权的 Windows 环境中，插件安装后仍能发现并运行 OMP Skills。

### 任务

- [x] 删除普通文件 `plugins/oh-my-paper-codex/skills`，替换为真实目录。
- [x] 创建九个 `omp-*` 工作流 Skills。
- [x] 将现有 `prompts/omp-*.md` 的工作流内容迁入对应 `SKILL.md`，保留必要 frontmatter。
- [x] 每个 Skill 的 `name` 与目录名一致，description 明确触发场景和不适用范围。
- [x] 将 `mpacc-thesis-writer` 及 OMP 工作流实际依赖的核心 Skills 以真实目录打包。
- [x] 不把全部无关科研/生物信息学 Skills 默认塞进插件，避免技能发现列表膨胀。
- [x] 增加同步/校验脚本，确保 canonical Skill 和插件副本一致。
- [x] 更新 plugin manifest 描述，不再声称自动提供未实现的 slash commands 或 plugin-level agents。

建议的最低插件 Skill 集：

```text
omp-setup
omp-plan
omp-survey
omp-ideate
omp-experiment
omp-write
omp-review
omp-sync
omp-delegate
mpacc-thesis-writer
research-pipeline-planner
research-idea-convergence
inno-paper-writing
inno-paper-reviewer
inno-reference-audit
```

如某 OMP Skill 依赖其他 Skill，必须在其 SKILL.md 中明确路由，并确保依赖一同打包或由项目脚手架提供。

## P1-A：Codex 原生 Agents 与项目脚手架

### 目标

新建论文项目后，Codex 可以原生加载论文角色，而不是只生成无法识别的 Markdown persona。

### 任务

- [x] 将公共角色定义渲染为 `.codex/agents/*.toml`。
- [x] TOML 使用顶层 `name`、`description`、`developer_instructions`。
- [x] 按角色设置最小权限：调研/审查角色优先 `read-only`，确需写论文或项目状态的角色使用 `workspace-write`。
- [x] 需要时在 `.codex/config.toml` 设置合理的 `[agents]` 并发和深度；默认不要递归 fan-out。（当前不需要额外覆盖默认值。）
- [x] 将 `research.rs` 的通用复制循环拆成 common、Claude、Codex 三个生成器。
- [x] Codex 项目 Skills 只写入 `.agents/skills`；`.codex/skills` 不作为主要发现位置。
- [x] 保留根 `AGENTS.md`，但把它压缩为稳定规则、文件路由、证据原则和验证方式。
- [x] `AGENTS.md` 不得在所有一次性任务前强制提问工作模式；只有真正需要角色选择时才询问。

建议代理：

```text
conductor
literature-scout
evidence-driver
paper-writer
reviewer
```

插件根目录可以保留 agent 模板作为 setup Skill 的资源，但不能假定 `plugins/.../agents/` 会自动注册为 Codex agents。`omp-setup` 应负责在用户同意后把模板写入目标项目 `.codex/agents/`。

## P1-B：Codex 原生 Hooks

### 目标

现有 session context、任务完成记录和阶段转换逻辑通过 Codex hooks 工作。

### 任务

- [x] 在插件中创建 `hooks/hooks.json`，并在 manifest 中明确 `hooks` 路径。
- [x] 使用 `CLAUDE_PLUGIN_ROOT` 定位插件脚本，不依赖安装目录硬编码。
- [x] 为生成项目创建 `.codex/hooks.json`，命令同时提供 Unix 和 `commandWindows` 版本。
- [x] `SessionStart` 输出符合 Codex additional context 规则。
- [x] `Stop` hook 输出合法 JSON，不再直接打印普通文本。
- [x] `PostToolUse` matcher 同时考虑 `apply_patch`、`Write` 等别名，但不假设能拦截所有写操作。
- [x] 文档提示用户通过 `/hooks` 审查并信任非托管 hooks。（P2 文档阶段）
- [x] hook 脚本反复执行必须幂等，不能无限追加相同记录。

注意：安装或启用插件不会自动信任 hooks。验收不能通过绕过 hook trust 的危险参数实现。

## P1-C：修复 Skill 资源单一来源

- [x] 将 `mpacc-thesis-writer` 加入 `src-tauri/resources/skills/` 及资源 scope/catalog。
- [x] 比较根 `skills/`、Tauri resources 和 Codex 插件中每个打包 Skill 的内容与依赖。
- [x] 调整 `sync-research-skills.mjs`：`check` 模式可在全新克隆中运行，不再需要 upstream。
- [x] 在 CI 可调用的校验中加入缺失依赖检查：SKILL.md 引用的相对文件、scripts 和 references 必须存在。
- [x] 禁止用内容为 `../../skills` 的普通文件冒充链接。

## P2：安装器、文档和发布质量

### 安装器

- [x] 优先使用稳定的 `codex plugin marketplace add/list/remove` 和 `codex plugin add/list/remove`；当前 CLI 没有作为基本流程所需的 `upgrade` 子命令。
- [x] app-server 已移出基本安装路径。
- [x] 安装、状态、卸载均支持 Windows/macOS/Linux；fake CLI 覆盖 Windows `.cmd` 启动，CI 在三种平台执行。
- [x] 安装器不得覆盖用户 marketplace 中的其他插件；仅在明确 `--remove-marketplace` 且没有其他插件时删除 marketplace。
- [x] `package.json` 是插件版本来源，`skills:codex-plugin:sync` 负责同步 manifest，安装时先移除同名已安装插件再添加以刷新本地 cache。
- [x] 状态输出区分：marketplace 可见、plugin available/installed/enabled、skills discovered 与 hooks trusted（后二者须在 Codex `/skills`、`/hooks` 中确认）。

### 文档

- [x] 更新中英文 README。
- [x] 使用 `$omp-sync` 等 Codex 原生名称。
- [x] 说明 `$omp:sync` 只是在 Oh My Paper UI 中可选的兼容输入。
- [x] 删除“Codex 没有原生 hooks”的过时内容。
- [x] 区分原生 Codex CLI、Codex 桌面插件和 Oh My Paper 内嵌 Provider。
- [x] 给出插件安装、项目初始化、`/skills`、`/hooks`、卸载和故障排查步骤。

### CI

- [x] Node 单元测试与 lint（lint 作为非阻断的既有基线报告；当前仓库仍有 173 个既有 error）。
- [x] Rust 单元测试已加入跨平台 CI；本机完整复跑受工作区执行额度策略限制。
- [x] Skill/manifest/marketplace JSON 校验。
- [x] 插件目录结构校验。
- [x] Windows、macOS、Linux fake Codex Runner 测试。
- [ ] 可选的人工 live smoke，不在普通 PR 中消耗真实模型额度。

### P2 验证记录（2026-07-11）

`npm ci`、`npm test`、`npm run build`、`npm run skills:research:check`、
`npm run skills:codex-plugin:check` 与 `npm run test:codex-plugin` 均已通过。后者使用
全新临时 Codex home 和 fake CLI，覆盖 marketplace/add/list/remove 流程及 Windows `.cmd`
启动。hook 脚本语法与 JSON 输出也已检查。`npm run lint` 已执行，但报告 173 个既有
error（CI 因此保留为非阻断基线报告）。完整 `cargo test --manifest-path src-tauri/Cargo.toml`
已配置到 CI；本机最终复跑被工作区执行额度策略拒绝，P0 的 Rust 定向 unit/fixture
测试先前已通过。真实插件安装会修改用户全局 Codex 配置，依约未在本机执行。

## 7. 验收标准

只有全部满足才可称为“Codex 兼容完成”。

### 7.1 原生 Codex

- [ ] `codex plugin list` 显示 Oh My Paper 已安装。
- [ ] 在新会话输入 `/skills` 或 `$`，能看到九个 `omp-*` Skills。
- [ ] `$omp-sync` 能读取现有 `.pipeline` 并更新预期文件。
- [ ] `$omp-plan` 能基于当前阶段生成下一步计划，不伪造证据。
- [ ] `$omp-write` 能发现并使用 `mpacc-thesis-writer`。
- [ ] `/hooks` 能看到 OMP hooks，信任后 SessionStart 等事件实际触发。
- [ ] 项目 `.codex/agents/*.toml` 中的角色能被 Codex 子代理机制发现。

### 7.2 Oh My Paper 桌面应用

- [ ] 新 Codex 会话返回正文，不再出现 profile/unknown argument 错误。
- [ ] 命令执行、文件修改、MCP 和计划项能显示为时间线事件。
- [ ] usage 和 thread ID 正确保存。
- [ ] 关闭后可以恢复同一 Codex thread。
- [ ] 用户取消任务后不会遗留运行进程。
- [ ] `$omp:sync` 若启用 UI 兼容层，会被安全转换为 `$omp-sync`。

### 7.3 新建论文项目

- [ ] 项目根存在精简且有效的 `AGENTS.md`。
- [ ] `.agents/skills/mpacc-thesis-writer/SKILL.md` 实际存在。
- [ ] `.codex/agents/` 中是合法 TOML，不是 Markdown persona。
- [ ] `.codex/hooks.json` 语法有效并包含 Windows 命令覆盖。
- [ ] Claude 与 Codex 两套视图均可用，公共 `.pipeline` 状态一致。

### 7.4 跨平台与全新环境

- [ ] Windows `core.symlinks=false` 的全新克隆可以安装插件并发现 Skills。
- [ ] 不依赖开发者本机的 `dr-claw`、绝对路径或预先复制的 home 插件目录。
- [ ] 从未安装过旧版插件的用户可以完成安装。
- [ ] 已安装旧版的用户可以升级且 cache 不残留旧 Skills。

## 8. 建议验证命令

实施者应按实际环境调整，但至少运行：

```powershell
npm ci
npm test
npm run lint
npm run build
cargo test --manifest-path src-tauri/Cargo.toml
npm run skills:research:check
codex --version
codex plugin list --available --json
```

插件结构还应由仓库脚本检查：

```powershell
Test-Path plugins/oh-my-paper-codex/skills/omp-sync/SKILL.md
Test-Path plugins/oh-my-paper-codex/skills/mpacc-thesis-writer/SKILL.md
Test-Path plugins/oh-my-paper-codex/hooks/hooks.json
```

真实 Codex smoke 会消耗额度并可能修改项目，只能在用户授权的测试工作区执行。先使用 fake executable 和 JSONL fixtures 完成自动测试。

## 9. 实施协议

新模型接手后遵守以下节奏：

1. 先读取本文件和 `git status --short`。
2. 检查是否存在根 `AGENTS.md`；若存在，完整读取并服从。
3. 先完成 P0-A，不同时大改插件和脚手架。
4. 每个阶段先补测试或 fixture，再修改实现。
5. 每阶段结束运行相关测试，并在本文件的 checklist 中更新状态。
6. 如果官方 Codex CLI 行为与本文不同，以当前 `--help` 和官方文档为准，并在本文记录差异。
7. 不得因为测试环境缺依赖就删除测试；应安装依赖或清楚报告阻塞。
8. 不要提交、推送、发布或修改用户全局 Codex 配置，除非用户明确授权。
9. 不要顺手整理无关代码或用户已有改动。

## 10. 新对话启动 Prompt

将下面内容复制到新的 Codex 对话：

```text
请实施本仓库的 Codex 兼容改造。

首先完整阅读 docs/codex-compatibility-migration.md，然后检查 git status、当前 Codex CLI --help、仓库内适用的 AGENTS.md 和现有测试。不要覆盖或回滚用户已有修改。

严格按文档的 P0-A → P0-B → P0-C → P1 → P2 顺序推进。先只完成 P0-A：建立正确的 codex exec --json Runner、Codex JSONL 到内部 StreamChunk 的适配、Windows CLI 启动、thread 恢复和 fixtures/单元测试。完成并验证 P0-A 后，汇报改动、测试结果和剩余风险，等待我确认再进入下一阶段。

约束：
- 不使用 danger-full-access 或绕过 sandbox/approval 的危险参数。
- 不把真实模型调用作为普通单元测试前提。
- 不删除 Claude Code 支持。
- 不做无关重构。
- 不提交或推送，除非我明确要求。
- 遇到当前 Codex 行为与文档不同，以当前 CLI --help 和 OpenAI 官方文档为准，并更新工程文档。
```

## 11. 官方参考

- Codex Skills：<https://developers.openai.com/codex/skills>
- Codex 插件结构：<https://developers.openai.com/codex/plugins/build>
- Codex 非交互模式与 JSONL：<https://developers.openai.com/codex/noninteractive>
- Codex 项目自定义：<https://developers.openai.com/codex/concepts/customization>
- Codex 自定义代理：<https://developers.openai.com/codex/subagents>
- Codex Hooks：<https://developers.openai.com/codex/hooks>
