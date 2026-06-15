# workpanel

`workpanel` 是一个面向 issue 修复编排的工程化可视化原型。它把多个 coding agent 并发处理 issue 的过程拆成三层可控对象：

- issue 队列：每个 issue 的风险、分支、agent、阶段和合并状态。
- ADR 决策账本：每个关键方案选择必须留下 Context、Decision、Consequence 和状态。
- 验收闸门：测试、diff、截图、review、回归等证据必须满足后才能进入合并队列。

核心需求来自 [temp.md](/home/sanstoolow/issuecompl/temp.md:5)。

## 运行

这是一个无依赖静态项目，直接用浏览器打开 [index.html](/home/sanstoolow/issuecompl/index.html) 即可。

## 文件

- [index.html](/home/sanstoolow/issuecompl/index.html)：应用结构。
- [styles.css](/home/sanstoolow/issuecompl/styles.css)：可视化和响应式布局。
- [app.js](/home/sanstoolow/issuecompl/app.js)：示例数据、筛选、选择、ADR 状态和验收状态交互。
- [docs/adr/0001-workpanel-decision-acceptance.md](/home/sanstoolow/issuecompl/docs/adr/0001-workpanel-decision-acceptance.md)：项目级 ADR。
- [docs/acceptance.md](/home/sanstoolow/issuecompl/docs/acceptance.md)：验收清单。

## 验收重点

1. 打开页面后可以同时看到 issue 队列、决策账本、验收闸门和合并队列。
2. 选择不同 issue 时，中间流程图、右侧 ADR 和验收项同步变化。
3. 点击 ADR 的 `Approve` 或 `Revise` 后，决策状态和顶部指标同步变化。
4. 勾选验收项后，验收比例、详情和合并队列状态同步变化。
5. 页面在桌面和移动视口下不依赖构建步骤即可使用。
