# chat history

可以把 **修复 bug** 和 **添加功能** 设计成“统一主流程 + 类型特化分支”。

不要为 bug 和 feature 完全设计两套 workflow，否则状态会爆炸；也不要只用一个简单的 `Todo / Doing / Done`，否则阶段信息不够。比较稳的方式是：

> **统一状态机负责流转；不同任务类型负责准入条件、验收条件和中间检查点。**

---

## 1. 先区分三个概念

很多 workflow 设计混乱，是因为把这几个东西混在一起了：

### `status`：任务生命周期状态

例如：

```text
Intake -> Triage -> Ready -> In Progress -> Review -> QA -> Release -> Done
```

它回答的是：

> 这个任务现在处于生命周期的哪一步？

---

### `phase`：当前执行阶段

例如 bug 修复中的：

```text
Reproduce -> Diagnose -> Fix -> Regression Test
```

feature 开发中的：

```text
Spec -> Design -> Implement -> Acceptance Test
```

它回答的是：

> 当前正在做哪类工作？

---

### `subStatus` / `flags`：阻塞、等待、风险等横切状态

例如：

```text
blocked: true
blockedReason: "等待产品确认"
waitingFor: "QA"
riskLevel: "high"
```

它回答的是：

> 任务当前有没有异常、阻塞或外部依赖？

不要把 `Blocked`、`Waiting PM`、`Waiting QA` 全部塞进主状态机里，否则状态会越来越多。

---

## 2. 推荐的统一主流程

无论是 bug 还是 feature，都可以使用这一条主流程：

```text
New
  ↓
Triage
  ↓
Ready
  ↓
In Progress
  ↓
Code Review
  ↓
QA / Verification
  ↓
Ready to Release
  ↓
Released
  ↓
Done
```

同时允许这些辅助流转：

```text
Any State -> Blocked
Blocked -> Previous State

QA Failed -> In Progress
Review Changes Requested -> In Progress
Released Issue Found -> Reopened
Reopened -> Triage / In Progress

Any State -> Cancelled
```

更具体一点：

| 状态                  | 含义               | 谁主要负责          |
| ------------------- | ---------------- | -------------- |
| `New`               | 刚创建，信息可能不完整      | 提交人            |
| `Triage`            | 判断优先级、影响范围、是否值得做 | PM / Tech Lead |
| `Ready`             | 信息足够，可以开始做       | PM / Tech Lead |
| `In Progress`       | 开发中              | Developer      |
| `Code Review`       | 代码审查中            | Reviewer       |
| `QA / Verification` | 验证功能或修复是否正确      | QA / Developer |
| `Ready to Release`  | 可以发布，但还没上线       | Release Owner  |
| `Released`          | 已上线，观察中          | Owner          |
| `Done`              | 已确认完成，无需继续跟踪     | Owner          |

---

## 3. bug 修复的专用 workflow

bug 的核心不是“做一个东西”，而是：

> 证明问题存在，定位原因，修复后证明问题不再出现，并避免回归。

所以 bug 类型的阶段可以这样设计：

```text
Reported
  ↓
Reproduce
  ↓
Diagnose
  ↓
Fix
  ↓
Regression Test
  ↓
Verify
  ↓
Done
```

对应到统一主流程：

```text
New
  ↓
Triage
  ↓
Ready
  ↓
In Progress
      - Reproduce
      - Diagnose
      - Fix
      - Regression Test
  ↓
Code Review
  ↓
QA / Verification
  ↓
Released
  ↓
Done
```

### bug 从 `Triage` 到 `Ready` 的准入条件

bug 进入 `Ready` 前，最好要求这些信息齐全：

```text
- 复现步骤
- 实际结果
- 期望结果
- 影响范围
- 严重程度 severity
- 优先级 priority
- 环境信息，例如浏览器、系统、版本、账号类型
- 是否有截图、日志、报错信息
```

如果缺信息，不要进入 `Ready`，而是进入：

```text
Need More Info
```

或者用：

```text
status = Triage
subStatus = Waiting for Reporter
```

### bug 的关键状态切换

```text
New -> Triage
条件：bug 被创建

Triage -> Need More Info
条件：无法判断或信息不足

Triage -> Ready
条件：影响明确，信息足够，决定修

Ready -> In Progress
条件：有人认领

In Progress / Reproduce -> Cannot Reproduce
条件：无法复现

In Progress / Diagnose -> Fixing
条件：根因已定位

Fixing -> Code Review
条件：代码修改完成，并添加测试

Code Review -> In Progress
条件：review 要求修改

Code Review -> QA
条件：review 通过

QA -> In Progress
条件：验证失败

QA -> Ready to Release
条件：验证通过

Released -> Done
条件：线上验证通过，没有新增异常

Done -> Reopened
条件：问题复现或修复不完整
```

### bug 的 Done 定义

bug 不是代码合了就 Done。更合理的 `Done` 是：

```text
- 原始复现步骤已经无法复现
- 有回归测试，或者有明确说明为什么不加测试
- 相关影响范围已检查
- 已发布到目标环境
- 提交人、QA 或负责人确认
```

---

## 4. 添加功能的专用 workflow

feature 的核心不是“写代码”，而是：

> 明确要解决什么问题，定义验收标准，控制范围，然后逐步交付。

feature 可以这样设计：

```text
Idea
  ↓
Discovery
  ↓
Spec
  ↓
Design
  ↓
Implementation
  ↓
Acceptance Test
  ↓
Release
  ↓
Measure / Done
```

对应到统一主流程：

```text
New
  ↓
Triage
  ↓
Ready
      - Requirement clarified
      - Acceptance criteria defined
      - Design reviewed
  ↓
In Progress
      - Implement
      - Unit Test
      - Integration Test
  ↓
Code Review
  ↓
QA / UAT
  ↓
Ready to Release
  ↓
Released
  ↓
Done
```

### feature 从 `Triage` 到 `Ready` 的准入条件

feature 进入开发前，至少要有：

```text
- 背景：为什么要做？
- 目标：解决什么问题？
- 范围：做什么，不做什么？
- 用户故事或使用场景
- 验收标准 acceptance criteria
- UI / API / 数据结构说明，视情况而定
- 依赖项
- 风险点
- 是否需要灰度、feature flag、埋点
```

如果这些没确认，不应该进入 `Ready`。

### feature 的关键状态切换

```text
New -> Triage
条件：需求被提出

Triage -> Discovery
条件：价值不清楚，需要调研

Discovery -> Spec
条件：确定值得做

Spec -> Design
条件：需求范围明确

Design -> Ready
条件：技术方案和验收标准通过

Ready -> In Progress
条件：有人认领并开始开发

In Progress -> Code Review
条件：开发完成，自测通过

Code Review -> In Progress
条件：review 要求修改

Code Review -> QA / UAT
条件：review 通过

QA / UAT -> In Progress
条件：验收失败或需求理解有偏差

QA / UAT -> Ready to Release
条件：验收通过

Ready to Release -> Released
条件：发布完成

Released -> Done
条件：线上稳定，必要指标正常
```

### feature 的 Done 定义

feature 的 `Done` 不能只看代码是否合入，而要看：

```text
- 验收标准全部满足
- 相关测试通过
- 文档、配置、迁移脚本完成
- 已发布到目标环境
- feature flag、灰度、回滚方案处理完成
- 关键指标或日志可观测
- 产品或业务方确认
```

---

## 5. 状态管理建议：主状态不要太细，阶段信息单独存

比较推荐的数据结构是：

```ts
type WorkItemType = "bug" | "feature";

type Status =
  | "new"
  | "triage"
  | "ready"
  | "in_progress"
  | "code_review"
  | "qa"
  | "ready_to_release"
  | "released"
  | "done"
  | "cancelled"
  | "reopened";

type BugPhase =
  | "reproduce"
  | "diagnose"
  | "fix"
  | "regression_test"
  | "verify";

type FeaturePhase =
  | "discovery"
  | "spec"
  | "design"
  | "implementation"
  | "acceptance_test"
  | "measure";

type WorkItem = {
  id: string;
  type: WorkItemType;

  status: Status;
  phase?: BugPhase | FeaturePhase;

  title: string;
  description: string;

  assignee?: string;
  reviewer?: string;
  qaOwner?: string;

  priority: "p0" | "p1" | "p2" | "p3";
  severity?: "critical" | "high" | "medium" | "low";

  blocked: boolean;
  blockedReason?: string;

  acceptanceCriteria: string[];

  createdAt: string;
  updatedAt: string;

  history: StateTransition[];
};

type StateTransition = {
  from: Status;
  to: Status;
  actor: string;
  reason?: string;
  at: string;
};
```

核心思想是：

```text
status 控制主流程；
phase 描述当前做什么；
blocked / waiting / risk 作为附加字段；
history 记录每次状态变化。
```

这样比把所有状态都摊平成下面这种要好：

```text
Waiting For PM
Waiting For QA
Waiting For Review
Blocked By API
Bug Reproducing
Bug Fixing
Feature Designing
Feature Coding
Feature Testing
...
```

否则状态机会失控。

---

## 6. 阶段切换要用事件驱动，而不是随便改状态

不要让系统或人直接随便改 `status`。更好的方式是定义事件：

```text
submit
triage
mark_ready
start_work
request_review
approve_review
reject_review
start_qa
pass_qa
fail_qa
release
verify_release
reopen
cancel
block
unblock
```

每个事件都有：

```text
- 当前允许从哪些状态触发
- 触发条件
- 触发人
- 必填字段
- 副作用
```

例如：

```ts
const transitions = {
  start_work: {
    from: ["ready"],
    to: "in_progress",
    requiredFields: ["assignee"],
  },

  request_review: {
    from: ["in_progress"],
    to: "code_review",
    requiredFields: ["pullRequestUrl", "testResult"],
  },

  fail_qa: {
    from: ["qa"],
    to: "in_progress",
    requiredFields: ["qaFailureReason"],
  },

  release: {
    from: ["ready_to_release"],
    to: "released",
    requiredFields: ["releaseVersion", "releaseTime"],
  },

  reopen: {
    from: ["done", "released"],
    to: "reopened",
    requiredFields: ["reopenReason"],
  },
};
```

这样有几个好处：

```text
- 状态不会乱跳
- 每次切换都有原因
- 可以做权限控制
- 可以自动触发通知、CI、测试、发布流程
- 后续可以统计每个阶段耗时
```

---

## 7. bug 和 feature 最大的差异：准入条件和验收条件不同

主流程可以相同，但 gate 不同。

### bug 的核心 gate

| 阶段          | 必须回答的问题        |
| ----------- | -------------- |
| Triage      | 这是不是 bug？影响多大？ |
| Ready       | 能不能复现？信息够不够？   |
| In Progress | 根因是什么？修复范围多大？  |
| QA          | 原问题是否消失？有没有回归？ |
| Done        | 线上是否确认恢复？      |

### feature 的核心 gate

| 阶段          | 必须回答的问题        |
| ----------- | -------------- |
| Triage      | 值不值得做？优先级如何？   |
| Ready       | 需求清楚吗？验收标准清楚吗？ |
| In Progress | 是否按方案实现？       |
| QA / UAT    | 是否满足验收标准？      |
| Done        | 是否上线稳定？是否达到预期？ |

一句话：

```text
bug 关注：复现、根因、回归、验证。
feature 关注：价值、范围、设计、验收、发布。
```

---

## 8. 推荐的最小可用状态机

如果团队或系统还比较早期，不建议一开始搞太复杂。可以先用这个版本：

```text
Backlog
  ↓
Ready
  ↓
Doing
  ↓
Review
  ↓
Testing
  ↓
Ready to Release
  ↓
Done
```

外加三个特殊状态：

```text
Blocked
Cancelled
Reopened
```

然后通过 `type` 区分 bug 和 feature：

```text
type = bug
  requires: reproduce steps, expected result, actual result

type = feature
  requires: requirement, scope, acceptance criteria
```

这个版本已经可以覆盖大部分团队。

---

## 9. 一个比较完整的状态流示例

### bug 示例

```text
New
  -> Triage
  -> Ready
  -> In Progress / Reproduce
  -> In Progress / Diagnose
  -> In Progress / Fix
  -> Code Review
  -> QA / Regression Test
  -> Ready to Release
  -> Released
  -> Done
```

如果 QA 失败：

```text
QA -> In Progress / Fix
```

如果上线后又出现：

```text
Done -> Reopened -> Triage
```

---

### feature 示例

```text
New
  -> Triage
  -> In Progress / Discovery
  -> In Progress / Spec
  -> Ready
  -> In Progress / Implementation
  -> Code Review
  -> QA / Acceptance Test
  -> Ready to Release
  -> Released
  -> Done
```

如果验收时发现需求理解不对：

```text
QA -> In Progress / Spec
```

如果只是代码问题：

```text
QA -> In Progress / Implementation
```

---

## 10. 实际设计时的几个原则

### 第一，`Ready` 是非常关键的状态

很多流程混乱，是因为任务没准备好就开始开发。

`Ready` 应该意味着：

```text
开发可以不再频繁追问基础问题，可以直接开始做。
```

bug 的 `Ready`：

```text
- 能复现
- 有影响范围
- 有优先级
- 有期望结果
```

feature 的 `Ready`：

```text
- 需求明确
- 范围明确
- 验收标准明确
- 依赖明确
```

---

### 第二，`Done` 要有类型化定义

不要所有任务都用同一个模糊的 Done。

bug 的 Done：

```text
问题已修复 + 已验证 + 不会明显回归。
```

feature 的 Done：

```text
功能已上线 + 验收通过 + 业务方确认。
```

---

### 第三，`Blocked` 最好不是主状态

推荐这样：

```ts
status = "in_progress";
blocked = true;
blockedReason = "等待第三方接口联调";
```

而不是：

```ts
status = "blocked_by_third_party_api";
```

因为阻塞是横切状态，它可能发生在任何主状态上。

---

### 第四，允许回退，不要只允许前进

真实开发一定会回退：

```text
Review -> In Progress
QA -> In Progress
Released -> Reopened
Done -> Reopened
```

workflow 如果不允许回退，团队最后一定会绕过系统。

---

### 第五，状态切换最好有 guard

例如不能随便从 `In Progress` 到 `Done`：

```text
In Progress -> Done ❌
```

应该是：

```text
In Progress -> Review -> QA -> Release -> Done
```

除非是非常小的任务，可以允许 shortcut，但要显式记录：

```text
skipReviewReason
skipQAReason
```

---

## 11. 最推荐的设计总结

可以这样定：

```text
WorkItem
  - type: bug | feature
  - status: 生命周期状态
  - phase: 类型相关阶段
  - blocked: 是否阻塞
  - gates: 当前状态进入/退出条件
  - history: 状态切换记录
```

主 workflow：

```text
New -> Triage -> Ready -> In Progress -> Review -> QA -> Ready to Release -> Released -> Done
```

bug 特化：

```text
Reproduce -> Diagnose -> Fix -> Regression Test -> Verify
```

feature 特化：

```text
Discovery -> Spec -> Design -> Implement -> Acceptance -> Measure
```

核心判断：

```text
bug：是否复现？是否修复？是否回归？
feature：是否有价值？范围是否清楚？是否满足验收？
```

如果只能选一个最重要的原则，那就是：

> **状态机统一，准入和验收按任务类型区分。**

