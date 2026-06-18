# Workpanel State Schema

`workpanel/issues.json` 是状态源。面板可以将此数据镜像到 JavaScript、数据库或 tracker 集成，但 agent 应先更新结构化状态。

## Root

根节点可以是 issue 数组或包含 `issues` 数组的对象：

```json
{
  "issues": []
}
```

## Issue

必填字段：

```json
{
  "id": "PAY-1842",
  "title": "Checkout total drifts after coupon rollback",
  "type": "bug",
  "product": "billing-web",
  "severity": "high",
  "risk": "high",
  "stage": "ADR",
  "phase": "diagnose",
  "agent": "codex-a17",
  "branch": "fix/pay-1842-coupon-total",
  "owner": "Mina",
  "eta": "35m",
  "merge": "wait",
  "decisions": [],
  "acceptance": [],
  "signals": {
    "tests": "not run",
    "diff": "+0 -0",
    "review": "not started",
    "rollback": "unknown"
  }
}
```

## Enums

### 通用枚举

- `type`: `bug`, `feature`
- `stage`: `Intake`, `ADR`, `Patch`, `Checks`, `Review`, `Merge`, `Recheck`, `Done`
- `severity`: `low`, `medium`, `high`
- `risk`: `low`, `medium`, `high`
- `merge`: `wait`, `hold`, `pass`
- `decision.status`: `pending`, `needs-revision`, `accepted`

### Bug Phase

当 `type` 为 `bug` 时：

- `phase`: `reproduce`, `diagnose`, `fix`, `regression_test`, `verify`

### Feature Phase

当 `type` 为 `feature` 时：

- `phase`: `discovery`, `spec`, `design`, `implementation`, `acceptance_test`, `measure`

## Type 字段

`type` 字段决定 issue 适用哪个工作流 skill：

| type | 适用 skill | 分支命名 |
|------|-----------|---------|
| `bug` | bugflow | `fix/<issue-id>-<slug>` |
| `feature` | featflow | `feat/<issue-id>-<slug>` |

`type` 为可选字段（向后兼容）。未指定时，agent 根据 issue 内容推断。

## Phase 字段

`phase` 描述 issue 在当前 stage 内的细分执行阶段。与 `stage` 的区别：

- `stage` 回答：issue 在生命周期的哪一步？
- `phase` 回答：当前正在做哪类工作？

`phase` 为可选字段。当 issue 处于 `Intake` 或 `ADR` 等早期 stage 时，`phase` 描述更细粒度的状态。

## ADR Entry

每个 issue 必须在进入 `Patch` 之前至少有一条 ADR：

```json
{
  "id": "adr-1842-1",
  "title": "Move coupon rollback into pricing reducer",
  "context": "State mutation happens in both cart and payment views.",
  "decision": "Normalize rollback in the reducer and keep UI as a pure renderer.",
  "consequence": "Lower UI drift, requires reducer regression coverage.",
  "status": "pending"
}
```

使用简短、可审查的决策文本。不要在 ADR 中存储实现日志。

## Acceptance Gate

每个闸门代表证据，不是意图：

```json
{
  "label": "Unit tests cover coupon add, remove, rollback",
  "done": false,
  "evidence": "npm test -- pricing-reducer"
}
```

`evidence` 可选，但有证据时应添加。闸门只有在命令输出、review、截图、日志、issue tracker 或人类决策中存在证据时才能设为 `done: true`。

## Merge Invariants

issue 使用 `merge: "pass"` 的条件：

- 所有 ADR status 为 `accepted`
- 所有 acceptance gate 为 `done: true`
- 分支无未解决的合并冲突
- reviewer 或 human control point 未要求 hold

`merge: "hold"` 用于阻塞项。`merge: "wait"` 用于正常进行中或排队的工作。

## Intake Evidence（可选扩展）

Bug 和 Feature 的 intake 阶段可以附加结构化证据：

### Bug Intake Evidence

```json
{
  "intake_evidence": {
    "reproduced": true,
    "steps": ["step1", "step2"],
    "actual_result": "描述",
    "expected_result": "描述",
    "screenshots": [],
    "logs": [],
    "environment": "Chrome 126 / macOS 15"
  }
}
```

### Feature Intake Summary

```json
{
  "intake_summary": {
    "goal": "功能目标",
    "scope_in": ["做什么"],
    "scope_out": ["不做什么"],
    "acceptance_criteria": ["标准1"],
    "constraints": ["约束1"],
    "dependencies": [],
    "risks": [],
    "external_findings": []
  }
}
```

## Panel Synchronization

`signals.tests`、`signals.diff`、`signals.review`、`signals.rollback` 直接渲染在面板卡片上，保持简短。

如果面板仍有 `const issues = [...]` 在 `app.js` 中，使用 `scripts/sync_panel_data.py` 从 `workpanel/issues.json` 生成或替换。
