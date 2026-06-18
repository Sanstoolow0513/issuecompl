# Feature Workflow

特征开发的完整生命周期。遵循「统一状态机 + 类型特化」原则。

## Issue Lifecycle

```
Intake
  ↓ 需求确认 + 验收标准定义
ADR
  ↓ 方案选定 + 人类批准
Patch
  ↓ 功能实现 + 测试覆盖
Checks
  ↓ 验收标准逐条通过
Review
  ↓ 代码审查 + ADR 状态确认
Merge
  ↓ 所有闸门通过
Recheck
  ↓ 功能验收 + 指标验证
Done
```

## Phase 细化

Feature 在实施过程中经历以下 phase：

```
discovery → spec → design → implementation → acceptance_test → measure
```

| Phase | 含义 | 完成条件 |
|-------|------|---------|
| `discovery` | 需求探索 | 背景和目标明确 |
| `spec` | 需求规格 | 验收标准和范围已定义 |
| `design` | 方案设计 | ADR 已记录且人类已批准 |
| `implementation` | 功能实现 | 代码完成且测试通过 |
| `acceptance_test` | 验收测试 | 所有验收标准逐条通过 |
| `measure` | 效果度量 | 功能上线且关键指标正常 |

## 状态切换事件

```
intake_complete     Intake → ADR       条件：需求确认 + 验收标准定义
adr_approved        ADR → Patch        条件：方案选定 + 人类批准
patch_complete      Patch → Checks     条件：功能实现 + 测试添加
checks_pass         Checks → Review    条件：验收标准逐条通过
review_approve      Review → Merge     条件：审查通过 + ADR accepted
merge_ready         Merge → Recheck    条件：所有闸门 done + 无冲突
recheck_pass        Recheck → Done     条件：功能验收 + 指标正常
```

回退事件：

```
review_reject       Review → Patch     条件：审查要求修改
checks_fail         Checks → Patch     条件：验收标准未满足
recheck_fail        Recheck → Patch    条件：功能未达预期
scope_change        Any → Intake       条件：需求范围变更
adr_revise          ADR → Intake       条件：方案被否决，需要重新采集信息
```

## Human Control Points

以下情况**必须**等待人类决策：

- **ADR 批准**：Feature 的 ADR 一律需要人类批准（与 bugflow 不同）
- 方案涉及架构变更、公共 API、数据模型变动
- 范围变更或需求追加
- 验收标准模糊或有歧义
- 多个方案的取舍需要业务判断

## Feature 与 Bug 的关键差异

```
Feature intake 重点：理解要做什么 → 需要"听到" → 多源信息 + 人类确认
Bug     intake 重点：证明问题存在 → 需要"看到" → 浏览器/CLI工具

Feature ADR 重点：设计方案 → 取舍 → 人类必须参与
Bug     ADR 重点：根因分析 → 修复方案 → 模型可主导（低风险时）

Feature 验收：验收标准逐条通过 + 业务方确认
Bug     验收：原始问题不再复现 + 无回归
```

## Done 定义

Feature 的 Done 不是代码合并，而是：

- 所有验收标准满足
- 相关测试通过
- 文档、配置、迁移脚本完成（如适用）
- 已发布到目标环境
- feature flag / 灰度 / 回滚方案处理完成（如适用）
- 关键指标或日志可观测
- 产品或业务方确认
