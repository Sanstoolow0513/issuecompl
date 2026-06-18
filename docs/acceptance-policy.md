# Acceptance Policy

验收闸门是合并控制。作为有证据支撑的要求对待，不是清单装饰。

## Required Gate Types

根据 issue 选择合适的闸门。多数 issue 应至少包含三个：

- **测试证据**：单元测试、集成测试、E2E、回归测试或手动验证
- **Diff 范围**：确认变更文件与 ADR 一致，避免无关重构
- **Review 证据**：reviewer 批准、人类验收或显式阻塞状态
- **风险证据**：回滚方案、安全/隐私审查、迁移影响、API 兼容性或客户支持说明
- **视觉证据**：UI 变更的截图或视觉回归结果

## Done Criteria

只有在记录证据后才能设置闸门 `done: true`。可接受的证据包括：

- 通过的命令输出或 CI 结果
- Reviewer 或人类批准
- 截图、trace、日志或复现结果
- 明确说明某风险不适用及理由

不要因为 agent 打算稍后运行检查就标记闸门为 done。

## ADR Status Rules

- `pending`：方案已提出但未被接受
- `needs-revision`：方案被拒绝、与证据矛盾、不完整或不安全
- `accepted`：方案已审查且实现遵循该方案

高风险 issue 在任何 ADR 为 `pending` 或 `needs-revision` 时应保持 `merge: "hold"`。

## Type-Specific Acceptance

### Bug

Bug 闸门重点：
- 原始复现步骤不再触发问题
- 回归测试覆盖修复场景
- 相关影响范围已检查
- 无明显副作用

### Feature

Feature 闸门重点：
- 所有验收标准逐条满足
- 文档、配置、迁移脚本完成（如适用）
- Feature flag / 灰度 / 回滚方案处理完成（如适用）
- 关键指标或日志可观测

## Merge Readiness

所有 ADR accepted 且所有必要闸门 done 时才设 `merge: "pass"`。任何闸门被阻塞或 ADR 需要修改时设 `merge: "hold"`。工作正常进行中设 `merge: "wait"`。

验收部分完成时，在最终报告中总结缺失闸门，不要声称就绪。
