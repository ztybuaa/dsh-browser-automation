# dsh-browser-use

让 DeepSeek Harness 的 agent 操控浏览器的插件（Playwright）。元素定位用 accessibility 快照 + 数字索引 `ref`（见 [ADR-0001](docs/adr/0001-accessibility-snapshot-element-refs.md)），模型按 `ref` 引用元素、不手写 selector。

## 工具（9 个）

| 工具 | 说明 |
|---|---|
| `browser_navigate` | 打开 URL，返回可交互元素快照 |
| `browser_snapshot` | 返回当前页可交互元素快照（编号 `[1] [2]…`）|
| `browser_click` | 按 `ref` 点击元素 |
| `browser_type` | 按 `ref` 往输入框打字 |
| `browser_press_key` | 按键盘按键（Enter/Escape/Tab/方向键）|
| `browser_scroll` | 上/下滚动 |
| `browser_screenshot` | 截图保存为 PNG |
| `browser_extract` | 抽取页面正文文本 |
| `browser_close` | 关闭当前浏览器会话 |

## 安装

```sh
# 本地开发目录
dsh plugin --profile web add /path/to/dsh-browser-use

# 从 GitHub（需先在 profile 里 allowBuild）
dsh plugin --profile web add github:ztybuaa/dsh-browser-automation
```

安装后重启 DSH，即可在会话中让 agent 调用 `browser_*` 工具。

## 配置（cordis.patch.yml）

```yaml
- id: browser-use
  name: dsh-browser-use
  config:
    channel: chrome       # 用本机真 Chrome（绕过自动化检测与 429）
    userDataDir: 'C:/Users/<you>/.dsh/browser-use-profile'  # 持久登录档案
    headless: false       # 默认可见窗口；纯后台跑设 true
    minimized: true       # 启动即最小化到任务栏，需要时唤出查看
    timeoutMs: 30000
    screenshotDir: '.'
    maxChars: 20000       # browser_extract 正文截断上限
    proxy: ''             # 可选；留空自动探测（环境变量 → Windows 系统代理）
```

### 完整配置参考

| 配置 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `headless` | boolean | `false` | 可见窗口；纯后台跑设 `true` |
| `executablePath` | string? | — | 指定浏览器可执行文件 |
| `timeoutMs` | number | `30000` | 单次操作超时 |
| `screenshotDir` | string | `.` | 截图输出目录 |
| `proxy` | string? | — | 浏览器代理；留空自动探测（环境变量 → Windows 系统代理）|
| `maxChars` | number | `20000` | `browser_extract` 正文截断上限 |
| `channel` | string? | — | 如 `'chrome'` 用本机真 Chrome |
| `userDataDir` | string? | — | 持久登录档案目录（设置后登录态跨会话保留）|
| `minimized` | boolean | `false` | 启动即最小化到任务栏 |
| `cdpUrl` | string? | — | 连已运行 Chrome（Chrome 151 实测不可行，备选）|

### 快照格式

`browser_snapshot` / `browser_navigate` 返回紧凑快照：`title`、`url`，以及带数字索引 `[1] [2]…` 的可交互元素列表（role + 可见文本 + 必要属性）。`browser_click` / `browser_type` 用 `ref` 引用索引，不手写 selector。数据区域（表格/图表数值/长正文）用 `browser_extract` 读 `innerText`，不在快照里塞完整可访问性树（见 [ADR-0003](docs/adr/0003-compact-snapshot-extract.md)）。

## 复用登录态（持久 profile + 真 Chrome，首选）

1. 配置里设 `channel: 'chrome'` + `userDataDir`（指向一个专用目录）。
2. 启动一次，在弹出的 Chrome 窗口里手动登录 Google（一次性，之后永久复用）。
3. 之后每次会话插件都用这个 profile 启动，登录态跨会话保留，且不再触发 Google 的 429 限流。

备选：`cdpUrl` 连一个已用调试端口启动的 Chrome——但 Chrome 151 下实测不可行，仅作参考。

## 开发

```sh
pnpm install
pnpm exec playwright install chromium   # 首次需下载浏览器
pnpm test
pnpm typecheck
```

每 agent 一个独立浏览器会话，`browser_close` 或插件卸载时销毁。
