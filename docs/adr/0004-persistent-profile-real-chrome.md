# 复用登录态：持久 profile + 真 Chrome（userDataDir 首选）

首选 `userDataDir`（专用持久 profile 目录）+ `channel: 'chrome'`：启动独立真 Chrome、手动登录一次后跨会话保留登录态；`minimized: true` 让窗口启动即最小化到任务栏、需要时唤出。另保留 `cdpUrl`（`chromium.connectOverCDP`）连已运行 Chrome 的选项，但 Chrome 151 下实测不可行（连不上/启动挂起），仅作备选。

理由：Playwright 的 bundled Chromium 是「匿名自动化浏览器」，Google 等站点会识别并限流（HTTP 429）或拒绝登录（"browser not secure"）。用真 Chrome（`channel: 'chrome'`）+ 持久 profile 复用登录态，可一并绕过限流与登录墙。另外启动时带 `--disable-blink-features=AutomationControlled` 关掉自动化特征，进一步降低被检测概率。

考虑过的替代：CDP 连运行中 Chrome——Chrome 151 实测不可行，弃为首选；自动登录——必弹验证码/2FA 且凭据有泄露风险，弃用；仅 bundled Chromium + userDataDir——仍可能被检测为自动化；`launchPersistentContext` 指向真实日常 profile——挂起，弃用。
