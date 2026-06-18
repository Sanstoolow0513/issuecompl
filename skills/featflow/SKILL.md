---
name: featflow
description: 特征开发全流程编排。从需求采集到功能验收，通过 intake → ADR → worktree patch → check & review → merge → recheck 六阶段状态管理驱动特征交付。Intake 阶段采用 human-in-loop，综合知识库、外部信息和用户输入三源并重提出建议。
---

# Featflow

特征开发专用工作流。核心信条：**理解要做什么 → 设计方案 → 隔离实现 → 验收标准逐条过 → 安全交付。**

## Pipeline

```
Intake → ADR Decision → Worktree Patch → Check & Review → Merge → Recheck
```

## Checklist

每个阶段必须按序完成：

1. **Intake** — 多源信息采集 + human-in-loop 需求确认
2. **ADR Decision** — 提出 2-3 方案 + 权衡分析 + **人类批准**
3. **Worktree Patch** — 隔离分支实现功能 + 测试覆盖
4. **Check & Review** — 验收标准逐条验证 + 代码审查
5. **Merge** — ADR 全部 accepted + 闸门全部 done 后合并
6. **Recheck** — 功能验收 + 指标验证

## Phases

### 1. Intake — 多源信息采集 (Human-in-Loop)

目标：充分理解需求，从多个信息源综合形成建议。

读取 `references/intake-protocol.md` 获取详细的 intake 协议。

**三源信息模型（权重均等，三源并重）：**

| 信息源 | 采集方式 | 关注点 |
|-------|---------|-------|
| 知识库 | 项目文档、已有代码模式、ADR 历史、技术栈约束 | 已有的能力和限制 |
| 外部信息 | WebSearch、API 文档、设计参考、竞品分析 | 行业最佳实践和新可能 |
| 用户输入 | 直接对话确认需求、偏好、业务背景 | 真实意图和验收标准 |

核心行动：
1. 扫描知识库：项目文档、相关模块、历史 ADR
2. 获取外部信息：WebSearch 搜索相关技术方案和最佳实践
3. 收集用户输入：背景、目标、范围、验收标准、约束
4. 综合建议：基于三源信息形成需求摘要，呈现给用户确认

准入检查：
- 需求明确且用户已确认
- 验收标准已定义
- 范围已界定（做什么 + 不做什么）
- 关键依赖已识别

### 2. ADR Decision — 方案设计 (Human Required)

目标：提出设计方案，**必须**获得人类批准。

- 使用 superpowers `brainstorming` skill 驱动设计探索
- 提出 2-3 种方案，附带权衡分析和推荐理由
- 每个方案记录为 ADR：context / decision / consequence / status
- **等待用户选择和批准**后，ADR status 才能从 `pending` 变为 `accepted`
- 批准后写入设计文档

ADR 格式参考：

```json
{
  "id": "adr-<issue-id>-<seq>",
  "title": "设计方案标题",
  "context": "需求背景和约束",
  "decision": "采用的方案及理由",
  "consequence": "影响、取舍和后续约束",
  "status": "pending"
}
```

### 3. Worktree Patch — 隔离实现

目标：在隔离环境中实现功能。

- 使用 superpowers `using-git-worktrees` 创建隔离分支
- 分支命名：`feat/<issue-id>-<short-slug>`
- 按验收标准逐条实现
- 添加测试覆盖
- 保持 diff 范围与 ADR 一致，不混入无关重构

### 4. Check & Review — 验证与审查

目标：逐条验证验收标准。

- 使用 superpowers `verification-before-completion`：运行测试、lint、类型检查
- 使用 superpowers `requesting-code-review`：代码审查
- 逐条核对验收标准，每条附带证据
- 更新 issue 状态中的 signals

### 5. Merge — 合并

前置条件：
- 所有 ADR status 为 `accepted`
- 所有验收闸门 `done: true`
- 无未解决的合并冲突

使用 superpowers `finishing-a-development-branch` 完成合并流程。设置 `merge: "pass"`。

### 6. Recheck — 功能验收

目标：确认功能在目标环境正常工作。

- 验证功能满足所有验收标准
- 检查关键指标（如适用）
- 可选：使用浏览器工具进行视觉验证
- 标记 issue stage 为 `Done`

## State Model

使用 `workpanel/issues.json` 作为状态源。Feature issue 需包含：

```json
{
  "type": "feature",
  "stage": "Intake | ADR | Patch | Checks | Review | Merge | Recheck | Done",
  "phase": "discovery | spec | design | implementation | acceptance_test | measure"
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
