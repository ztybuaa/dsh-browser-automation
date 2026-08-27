# snapshot 保持紧凑快照，数据区用 browser_extract 读取

`browser_snapshot` 只返回紧凑快照：`title`/`url` + 带数字索引的可交互元素列表（`[1]` `[2]`…）。需要读数据区域（表格、卡片、图表数值）时，改用 `browser_extract` 抓页面正文（`innerText`，`maxChars` 截断，默认 20000）。

理由：曾尝试在快照里附带 Playwright `ariaSnapshot()` 的完整可访问性树，让模型直接从快照读数据区（本 ADR 早期版本）。实测单条快照膨胀到约 10MB、会话卡死，故回退为紧凑快照。数据区改由 `browser_extract` 按需读取——实测能直接拿到 Google Trends 的图表底层数值表（`x y1`）与 related 表格，满足需求。

考虑过的替代：完整可访问性树——信息全但体积失控，已回退；模型手写 selector 单独读某区域——违背 ADR-0001 的「不用 selector」精神，弃用。
