# workpanel

`workpanel` 是一个面向 issue 修复编排的工程化可视化原型。它把多个 coding agent 并发处理 issue 的过程拆成三层可控对象：

- **Issue 队列**：每个 issue 的风险、分支、agent、阶段和合并状态。
- **ADR 决策账本**：每个关键方案选择必须留下 Context、Decision、Consequence 和状态。
- **验收闸门**：测试、diff、截图、review、回归等证据必须满足后才能进入合并队列。

核心愿景见 [temp.md](temp.md)。

## 项目状态

当前处于 **静态原型** 阶段：

- 纯 HTML / CSS / JS，零构建依赖，浏览器直接打开即可使用。
- 数据由 `workpanel/issues.json` 驱动，附带校验和同步脚本。
- 运行时状态仅在内存中，刷新后重置。
- Agent 集成通过 `skills/workpanel-orchestrator/` 的 skill 协议实现。

## 架构

```
用户 ──▶ index.html ──▶ app.js ──读取──▶ issues-data.js (globalThis.WORKPANEL_ISSUES)
                                              ▲
                                              │ sync_panel_data.py --out
                                              │
                                        issues.json  ◀── coding agent 修改
                                              │
                                              └── validate_state.py 校验
```

issue 生命周期：**Intake → ADR → Patch → Checks → Review → Merge**

五个面板：

| 面板 | 职责 |
|---|---|
| Issue Queue（左栏） | 筛选 / 排序所有 issue，按风险、阶段、ETA 排列 |
| Resolution Map（中央） | SVG 流程图展示当前 issue 从 Intake 到 Merge 的路径和阻塞状态 |
| Decision Gate（右栏） | ADR Ledger + Acceptance Gates + Merge Contract |
| Metrics（顶栏） | issue 数、agent 数、待决策数、验收率、合并就绪数 |
| Merge Train（底栏） | 按阶段分列所有 issue 的合并状态（pass / wait / hold） |

## 运行

浏览器直接打开 [index.html](index.html) 即可。

如果修改了 `workpanel/issues.json`（issue 状态的源文件），需要依次运行校验和同步：

```bash
# 校验 JSON 结构是否合法
python3 skills/workpanel-orchestrator/scripts/validate_state.py workpanel/issues.json

# 生成 issues-data.js 供静态页面加载
python3 skills/workpanel-orchestrator/scripts/sync_panel_data.py workpanel/issues.json --out workpanel/issues-data.js
```

`sync_panel_data.py` 还支持 `--app-js app.js` 模式（直接替换 app.js 中的 fixture），但当前架构推荐使用 `--out` 生成独立数据文件。

## 文件

| 文件 | 说明 |
|---|---|
| [index.html](index.html) | 应用结构，加载 CSS / 数据 / 逻辑 |
| [styles.css](styles.css) | 可视化和响应式布局 |
| [app.js](app.js) | 筛选、选择、ADR 状态和验收交互逻辑 |
| [workpanel/issues.json](workpanel/issues.json) | Agent 可修改的 issue / ADR / acceptance 源状态 |
| [workpanel/issues-data.js](workpanel/issues-data.js) | 由源状态生成的静态页面数据镜像 |

### Skill 和文档

| 文件 | 说明 |
|---|---|
| [skills/workpanel-orchestrator/SKILL.md](skills/workpanel-orchestrator/SKILL.md) | Coding agent 使用的 workpanel 编排协议 |
| [skills/workpanel-orchestrator/agents/openai.yaml](skills/workpanel-orchestrator/agents/openai.yaml) | OpenAI agent 接口声明 |
| [docs/adr/0001-workpanel-decision-acceptance.md](docs/adr/0001-workpanel-decision-acceptance.md) | 项目级 ADR：决策与验收优先的 workpanel |
| [docs/adr/0002-workpanel-state-source.md](docs/adr/0002-workpanel-state-source.md) | 状态源和静态数据镜像 ADR |
| [docs/acceptance.md](docs/acceptance.md) | 验收清单 |

### 工具脚本

| 文件 | 说明 |
|---|---|
| [scripts/validate_state.py](skills/workpanel-orchestrator/scripts/validate_state.py) | 校验 issues.json 结构、字段约束、合并一致性 |
| [scripts/sync_panel_data.py](skills/workpanel-orchestrator/scripts/sync_panel_data.py) | 将 JSON 状态同步到 JS 数据文件或 app.js fixture |

## 支持的 Agent

workpanel 通过 skill 协议接入，不绑定特定 agent。当前示例数据中包含：

- `codex-a17` / `codex-a22` — OpenAI Codex
- `claude-b03` — Claude Code
- `cursor-c21` — Cursor
- `opencode-d09` — OpenCode
- `pi-e14` — Pi Coding Agent

## 验收重点

1. 打开页面后可以同时看到 Issue Queue、Resolution Map、Decision Gate 和 Merge Train。
2. 选择不同 issue 时，中间流程图、右侧 ADR 和验收项同步变化。
3. 点击 ADR 的 Approve 或 Revise 后，决策状态和顶部指标同步变化。
4. 勾选验收项后，验收比例、详情和合并队列状态同步变化。
5. 页面在桌面和移动视口下不依赖构建步骤即可使用。
6. `validate_state.py` 能正确拒绝不合法的 JSON 状态。
