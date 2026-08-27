# DSH Browser-Use Plugin

让 DeepSeek Harness 的 agent 能操控浏览器的插件。本文件是项目术语表（glossary），只定义词，不含实现细节。

## Language

**plugin（插件）**:
DeepSeek Harness 的最小能力单元：一个导出 `apply(ctx)` 的 TypeScript 模块，通过 `ctx` 注册能力。
_Avoid_: 扩展、模块、addon

**tool（工具）**:
面向模型的能力，agent 按声明好的 schema 调用；用 `defineTool` 定义、`ctx.tools.register` 注册。
_Avoid_: 函数、action、命令

**browser-use（本项目语境）**:
让 agent 操控浏览器网页的能力（导航、点击、滚动、输入、截图、抽取文本等）。
_Avoid_: 浏览器自动化、爬虫、RPA
注：与 Python 开源项目 `browser-use` 同名但不同物——后者仅作思路参考，不作为本项目依赖。

**snapshot（页面快照）**:
把当前页面可交互元素序列化成带数字索引（`[1]` `[2]`…）的文本列表，供模型引用元素。
_Avoid_: DOM 树、HTML 原文

**element ref（元素引用）**:
模型在动作里定位元素的方式——引用快照里的数字索引（如 `ref=3`），而非手写 CSS/XPath。

**browser session（浏览器会话）**:
一次 agent 任务独占的浏览器实例，任务结束即销毁，互不共享。
_Avoid_: 标签页、窗口、单例

**proxy（代理）**:
浏览器访问网络时走的代理服务器地址（如 `http://127.0.0.1:7897`）；插件启动浏览器时自动探测（环境变量 → Windows 系统代理），可用配置显式覆盖。

**persistent profile（持久登录档案）**:
一个持久化的浏览器 profile 目录（`userDataDir`），登录态/cookie 存于此、跨会话保留；可被多个会话共享，用于「全部登录」。用真 Chrome（`channel: 'chrome'`）承载以绕过站点的自动化检测。

**bundle（插件包）**:
可分发的最小安装单元：一个 npm 包，`package.json` 声明 `dsh.bundle.patch`，经 `dsh plugin add` 装入 profile。
_Avoid_: 包、模块、依赖

**profile（配置档案）**:
一个可运行组合的目录（`$DSH_HOME/profiles/<name>`），按有序的 bundle 列表组合出最终配置。
