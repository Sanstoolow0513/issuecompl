# workpanel

`workpanel` 是一个面向 issue 修复编排的工程化可视化原型。它把多个 coding agent 并发处理 issue 的过程拆成三层可控对象：

- **Issue 队列**：每个 issue 的风险、分支、agent、阶段和合并状态。
- **ADR 决策账本**：每个关键方案选择必须留下 Context、Decision、Consequence 和状态。
- **验收闸门**：测试、diff、截图、review、回归等证据必须满足后才能进入合并队列。

核心愿景见 [temp.md](temp.md)。

## 项目结构

```
issuecompl/
├── panel/                 # React 前端应用（Vite + React）
│   ├── src/
│   │   ├── App.jsx        # 主组件，组装五面板布局
│   │   ├── main.jsx       # React 入口
│   │   ├── index.css      # 全局样式
│   │   ├── components/    # UI 组件
│   │   │   ├── Topbar.jsx         # 指标 + 操作按钮
│   │   │   ├── IssueQueue.jsx     # 左栏：筛选 / 排序 / issue 列表
│   │   │   ├── IssueCard.jsx      # issue 卡片
│   │   │   ├── MapPanel.jsx       # 中央：Resolution Map 容器
│   │   │   ├── ResolutionMap.jsx  # SVG 流程图
│   │   │   ├── SignalStrip.jsx    # 信号指标条
│   │   │   ├── DecisionGate.jsx   # 右栏：ADR + 验收 + 合并
│   │   │   ├── DecisionItem.jsx   # 单条 ADR 决策
│   │   │   ├── AcceptanceList.jsx # 验收闸门列表
│   │   │   ├── MergeContract.jsx  # 合并合约
│   │   │   └── MergeTrain.jsx     # 底栏：合并队列
│   │   ├── hooks/
│   │   │   └── useIssues.js       # issue 状态管理 (useReducer)
│   │   └── utils/
│   │       └── issueHelpers.js    # 过滤、排序、计算等纯函数
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── workpanel/
│   └── issues.json        # Agent 可修改的 issue 状态源文件
├── docs/                  # 文档和 ADR
├── skills/                # Agent 编排协议
└── temp.md                # 项目愿景
```

## 架构

```
panel/ (React)
  └── App.jsx ── import ──▶ ../../workpanel/issues.json
                                      ▲
                                      │
                                coding agent 修改
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

```bash
cd panel
npm install
npm run dev
```

如果修改了 `workpanel/issues.json`，可运行校验：

```bash
python3 skills/workpanel-orchestrator/scripts/validate_state.py workpanel/issues.json
```

生产构建：

```bash
cd panel
npm run build
```

构建产物输出到 `panel/dist/`。

## Skill 和文档

| 文件 | 说明 |
|---|---|
| [skills/workpanel-orchestrator/SKILL.md](skills/workpanel-orchestrator/SKILL.md) | Coding agent 使用的 workpanel 编排协议 |
| [skills/workpanel-orchestrator/agents/openai.yaml](skills/workpanel-orchestrator/agents/openai.yaml) | OpenAI agent 接口声明 |
| [docs/adr/0001-workpanel-decision-acceptance.md](docs/adr/0001-workpanel-decision-acceptance.md) | 项目级 ADR：决策与验收优先的 workpanel |
| [docs/adr/0002-workpanel-state-source.md](docs/adr/0002-workpanel-state-source.md) | 状态源和静态数据镜像 ADR |
| [docs/acceptance.md](docs/acceptance.md) | 验收清单 |

## 工具脚本

| 文件 | 说明 |
|---|---|
| [scripts/validate_state.py](skills/workpanel-orchestrator/scripts/validate_state.py) | 校验 issues.json 结构、字段约束、合并一致性 |
| [scripts/sync_panel_data.py](skills/workpanel-orchestrator/scripts/sync_panel_data.py) | 将 JSON 状态同步到 JS 数据文件（旧架构，React 版直接 import JSON） |

## 支持的 Agent

workpanel 通过 skill 协议接入，不绑定特定 agent。当前示例数据中包含：

- `codex-a17` / `codex-a22` — OpenAI Codex
- `claude-b03` — Claude Code
- `cursor-c21` — Cursor
- `opencode-d09` — OpenCode
- `pi-e14` — Pi Coding Agent

## 验收重点

1. `npm run dev` 后可以同时看到 Issue Queue、Resolution Map、Decision Gate 和 Merge Train。
2. 选择不同 issue 时，中间流程图、右侧 ADR 和验收项同步变化。
3. 点击 ADR 的 Approve 或 Revise 后，决策状态和顶部指标同步变化。
4. 勾选验收项后，验收比例、详情和合并队列状态同步变化。
5. 页面在桌面和移动视口下均可正常使用。
6. `validate_state.py` 能正确拒绝不合法的 JSON 状态。
