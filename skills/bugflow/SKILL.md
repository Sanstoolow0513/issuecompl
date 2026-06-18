---
name: bugflow
description: Bug修复全流程编排。从复现诊断到修复验证，通过 intake → ADR → worktree patch → check & review → merge → recheck 六阶段状态管理驱动 bug 修复。使用浏览器工具采集证据，结合 worktree 隔离和验收闸门确保修复质量。
---

# Bugflow

Bug 修复专用工作流。核心信条：**证明问题存在 → 定位根因 → 隔离修复 → 证明问题消失 → 确认无回归。**

## Pipeline

```
Intake → ADR Decision → Worktree Patch → Check & Review → Merge → Recheck
```

## Checklist

每个阶段必须按序完成：

1. **Intake** — 复现 bug、采集证据、评估影响
2. **ADR Decision** — 分析根因、提出修复方案、记录 ADR
3. **Worktree Patch** — 隔离分支实现修复 + 回归测试
4. **Check & Review** — 运行验证、代码审查、收集验收证据
5. **Merge** — ADR 全部 accepted + 闸门全部 done 后合并
6. **Recheck** — 用 intake 同款工具验证修复效果

## Phases

### 1. Intake — 复现与诊断

目标：证明 bug 存在，采集可用证据。

读取 `references/intake-protocol.md` 获取详细的 intake 协议。

核心行动：
- 从 issue 或报告提取复现步骤
- 使用项目对应工具复现问题（浏览器工具、CLI、API 调用等）
- 采集诊断信息：错误日志、堆栈、控制台输出、网络请求
- 记录：复现步骤、实际结果 vs 期望结果、影响范围、严重程度、环境信息

准入检查：
- Bug 已确认可复现（或有充分证据证明存在）
- 影响范围已评估
- 严重程度和优先级已判定

### 2. ADR Decision — 修复方案决策

目标：基于诊断提出修复方案，记录决策。

- 分析根因，提出修复方案
- 至少记录一条 ADR：context / decision / consequence / status
- 低风险 bug：模型可直接推进，ADR status 设为 `pending`，合并前确认
- 高风险 bug（涉及支付、认证、数据丢失、迁移、安全、隐私、权限、公共 API）：**必须** human review 后才能推进

ADR 格式参考：

```json
{
  "id": "adr-<issue-id>-<seq>",
  "title": "修复方案标题",
  "context": "问题根因描述",
  "decision": "采用的修复方案",
  "consequence": "影响和后果",
  "status": "pending"
}
```

### 3. Worktree Patch — 隔离修复

目标：在隔离环境中实现修复。

- 使用 superpowers `using-git-worktrees` 创建隔离分支
- 分支命名：`fix/<issue-id>-<short-slug>`
- 实现修复代码 + 添加回归测试
- 保持 diff 最小，不混入无关重构

### 4. Check & Review — 验证与审查

目标：确认修复有效且无副作用。

- 使用 superpowers `verification-before-completion`：运行测试、lint、类型检查
- 使用 superpowers `requesting-code-review`：代码审查
- 收集验收证据：测试结果、diff 范围确认、截图/日志
- 更新 issue 状态中的 signals

### 5. Merge — 合并

目标：安全合并修复。

前置条件：
- 所有 ADR status 为 `accepted`
- 所有验收闸门 `done: true`
- 无未解决的合并冲突

使用 superpowers `finishing-a-development-branch` 完成合并流程。设置 `merge: "pass"`。

### 6. Recheck — 验证修复

目标：确认修复在目标环境生效。

- 使用 intake 阶段同款工具验证修复效果
- 确认原始复现步骤无法再复现 bug
- 检查相关功能无回归
- 标记 issue stage 为 `Done`

## State Model

使用 `workpanel/issues.json` 作为状态源。Bug issue 需包含：

```json
{
  "type": "bug",
  "stage": "Intake | ADR | Patch | Checks | Review | Merge | Recheck | Done",
  "phase": "reproduce | diagnose | fix | regression_test | verify"
}
```

详见 `docs/state-schema.md`。验收策略详见 `docs/acceptance-policy.md`。

## Validation

修改状态后运行：

```bash
python3 scripts/validate_state.py workpanel/issues.json
```

## Reporting

完成每个阶段后报告：
- Issue id 和 branch/worktree
- 当前 stage 和 phase
- ADR 创建或更新情况
- 验收闸门变化和证据
- 校验命令执行结果
- 需要人类决策的阻塞项
