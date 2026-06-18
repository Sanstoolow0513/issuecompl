# Bug Intake Protocol

Bug intake 的目标是**证明问题存在并采集足够的诊断信息**。不要跳过复现直接修代码。

## 信息采集清单

intake 结束前必须收集：

- 复现步骤（精确到操作序列）
- 实际结果（截图、日志、报错信息）
- 期望结果
- 影响范围（哪些用户、哪些场景、哪些环境）
- 严重程度：`critical` / `high` / `medium` / `low`
- 环境信息：浏览器、系统、版本、账号类型、网络环境

如果信息不足，不要进入 ADR 阶段。标记 issue 为 `blocked`，`blockedReason` 写明缺失项。

## 工具选择

根据项目类型选择复现工具：

| 项目类型 | 推荐工具 | 备选方案 |
|---------|---------|---------|
| Web 前端 | `cursor-ide-browser` MCP（browser_navigate + browser_snapshot + browser_take_screenshot） | playwright-cli |
| API / 后端 | curl / httpie / 直接命令执行 | Postman 导出 |
| CLI 工具 | 直接命令执行 + 输出捕获 | — |
| 数据库相关 | SQL 查询 + 结果截取 | — |
| 移动端 | 人工提供截图 + 日志 | — |

### cursor-ide-browser MCP 使用指南

Web 项目优先使用 `cursor-ide-browser` MCP 进行复现：

1. `browser_navigate` 打开目标页面
2. `browser_snapshot` 获取页面结构
3. 按复现步骤操作：`browser_click`、`browser_type`、`browser_fill` 等
4. `browser_take_screenshot` 截取证据
5. `browser_cdp` + `Runtime.evaluate` 检查控制台错误和网络请求

### playwright-cli 使用

如果 `cursor-ide-browser` 不可用或不适合：

```bash
npx playwright open <url>              # 手动复现并录制
npx playwright test <test-file>        # 运行已有测试
npx playwright screenshot <url> out.png # 截取页面状态
```

### 工具不可用时的降级策略

如果项目所需的检查工具都不可用：

1. 要求用户提供复现证据（截图、日志、视频）
2. 通过代码审查和日志分析进行间接诊断
3. 在 ADR 中明确标注「未能自动复现，基于证据分析」

## 诊断流程

```
收集报告 → 尝试复现 → 复现成功？
  ├─ 是 → 采集诊断信息 → 定位疑似根因 → 进入 ADR
  └─ 否 → 扩大环境/数据范围重试 → 仍失败？
       ├─ 是 → 标记 Cannot Reproduce，记录尝试过程
       └─ 否 → 回到采集诊断信息
```

## 输出格式

intake 完成后，在 issue 状态中记录：

```json
{
  "stage": "ADR",
  "phase": "diagnose",
  "intake_evidence": {
    "reproduced": true,
    "steps": ["step1", "step2", "..."],
    "actual_result": "描述",
    "expected_result": "描述",
    "screenshots": ["path/to/screenshot.png"],
    "logs": ["关键日志摘录"],
    "environment": "Chrome 126 / macOS 15 / production"
  }
}
```
