# Bug Workflow

Bug 修复的完整生命周期。遵循「统一状态机 + 类型特化」原则。

## Issue Lifecycle

```
Intake
  ↓ 复现确认 + 信息齐全
ADR
  ↓ 修复方案确定 + ADR 记录
Patch
  ↓ 代码修复 + 回归测试
Checks
  ↓ 测试通过 + diff 范围确认
Review
  ↓ 代码审查 + ADR 状态更新
Merge
  ↓ 所有闸门通过
Recheck
  ↓ 复现验证通过
Done
```

## Phase 细化

Bug 在 `Patch` 阶段内部经历以下 phase：

```
reproduce → diagnose → fix → regression_test → verify
```

| Phase | 含义 | 完成条件 |
|-------|------|---------|
| `reproduce` | 复现 bug | 有可靠复现步骤和证据 |
| `diagnose` | 定位根因 | 根因已明确，影响范围已评估 |
| `fix` | 实现修复 | 代码修改完成 |
| `regression_test` | 回归测试 | 回归测试覆盖修复场景 |
| `verify` | 验证修复 | 原始复现步骤不再触发 bug |

## 状态切换事件

```
intake_complete     Intake → ADR     条件：复现确认 + 信息齐全
adr_recorded        ADR → Patch      条件：至少一条 ADR 已记录
patch_complete      Patch → Checks   条件：代码修复 + 测试添加
checks_pass         Checks → Review  条件：测试通过 + diff 范围确认
review_approve      Review → Merge   条件：审查通过 + ADR accepted
merge_ready         Merge → Recheck  条件：所有闸门 done + 无冲突
recheck_pass        Recheck → Done   条件：原始问题不再复现 + 无回归
```

回退事件：

```
review_reject       Review → Patch   条件：审查要求修改
checks_fail         Checks → Patch   条件：测试失败或 diff 超范围
recheck_fail        Recheck → Patch  条件：问题仍可复现
reopen              Done → Intake    条件：问题在生产环境复现
```

## Human Control Points

以下情况必须等待人类决策：

- ADR status 为 `pending` 且 issue 为高风险
- 修复方案变更了公共行为、持久化、安全、隐私、计费或兼容性
- 验收证据为手动采集、模糊或缺失
- 无法复现但有用户报告（Cannot Reproduce 决策）

## Done 定义

Bug 的 Done 不是代码合并，而是：

- 原始复现步骤已无法复现
- 有回归测试覆盖（或有明确理由说明为什么不加）
- 相关影响范围已检查
- 已发布到目标环境
- 提交人或负责人确认
