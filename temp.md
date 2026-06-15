# workpanel — 项目愿景

## 要解决的问题

当产品有多个 bug / issue 需要并发修复时，现有 coding agent 工具链存在三个盲区：

1. **决策不透明** — agent 的方案选择埋在聊天记录里，无法在一个面板里对比审查。
2. **并发不可控** — 多个 agent 同时改同一仓库，缺少分支冲突预判和合并裁决机制。
3. **验收无闭环** — 测试结果、diff 范围、截图、安全审查等证据散落各处，合并前没有统一的"闸门"检查。

## 核心理念

> 每一步决策清晰、每一次合并有据、每一个 agent 可控。

用 ADR（Architecture Decision Record）思路管理 agent 的修复决策，把 issue 生命周期拆成 **Intake → ADR → Patch → Checks → Review → Merge** 六个阶段，并通过三层可控对象实现编排：

| 层 | 职责 | 对应面板 |
|---|---|---|
| Issue 队列 | 风险、分支、agent、阶段、ETA | 左侧 Queue |
| ADR 决策账本 | Context → Decision → Consequence → Status | 右侧 Decision Gate |
| 验收闸门 | 测试、diff、截图、review、回归等证据 | 右侧 Acceptance Gates |

三层状态统一收敛到 **Merge Train**，只有 ADR 全部 Accepted + 验收 100% 才能进入合并队列。

## 使用的工具 / Agent

| 工具 | 定位 |
|---|---|
| Claude Code | 主力 coding agent，深度推理 |
| Codex (OpenAI) | 并行 issue 修复 |
| Cursor / Cursor CLI | IDE 集成 + skill 驱动 |
| Pi Coding Agent | 轻量 patch 场景 |
| OpenCode | 备选 agent 通道 |

workpanel 不绑定特定 agent，通过 `skills/workpanel-orchestrator/` 下的 skill 协议统一接入。

## 当前阶段

- **已完成**：静态可视化原型（纯 HTML/CSS/JS，零依赖），包含 Issue Queue、Resolution Map、ADR Ledger、Acceptance Gates、Merge Train 五个面板。数据由 `workpanel/issues.json` 驱动，附带校验和同步脚本。
- **进行中**：skill 协议设计（`workpanel-orchestrator`），让 coding agent 能以结构化方式读写 issue 状态。

## 下一步方向

1. **持久化** — 运行时状态落盘（当前仅内存），agent 修改后自动同步面板。
2. **外部 issue 源** — 接入 GitHub Issues / Linear / Jira，映射到内部 schema。
3. **多 agent 仲裁** — 冲突分支自动比对 diff，按 ADR 和证据择优合并。
4. **自动化验收** — 测试结果、lint、安全扫描等证据自动填充闸门。
5. **review 自动化** — 利用 Bugbot / Security Review 等 subagent 实现决策辅助审查。
