# Benchmark 冻结前实测记录（2026-09-02）

## 结论

题目冻结前必须先通过真实浏览器实测。本记录使用 Playwright CLI 打开候选题目的真实入口和 Google 查询，验证页面可访问性、原始素材是否可见、评论数量是否达到计划，以及页面是否存在会污染边界的模块。

本轮只做“能否作为 benchmark 题目”的设计期实测，不运行 Browser Use 插件评分，也不把实测摘录写成正式答案集。

当前没有任何题目改为 `frozen`。本轮真实搜索复核后，Reddit 和 Google 各五题均按当前设计标为 `validated`；`frozen` 仍留给后续正式答案采集和人工复核。

- Reddit 固定帖子在当前浏览器会话中可以读取，但 Reddit 搜索结果页会混入其他社区，执行规格必须逐条核验 community；
- Google 查询都能打开并有分页，但 AI Overview、视频、Shopping、People also search for 等模块与自然结果混排，执行边界已明确排除这些模块，并限定最多两页收集有机结果；
- 需要把这次实测的入口、环境、结果模块和素材数量写入每个案例规格后，才能冻结。

旧版 Reddit 设计曾改为固定帖子入口，但这与用户要求的“固定搜索规则、机械取样”不一致。本轮重新打开 Reddit 搜索页并改用五个固定查询：精确型号词、solar charging、review、setup 和 customer service；每题的结果数量、社区标签、排序和评论选择规则已写入对应 JSON。原有固定帖子答案样本仍保存在 `dataset/private/design-validation/rd-001.json` 至 `dataset/private/design-validation/rd-005.json`，它们作为历史设计证据保留，不能替代新的搜索型答案。

## 实测环境

- 浏览器：Playwright CLI 真实 Chromium 会话
- 实测日期：2026-09-02（Asia/Shanghai）
- Google：`google.com`、`hl=en`、`gl=us`、桌面会话，未登录；页面显示 “Unknown - Can't determine location”
- Reddit：`www.reddit.com`，未登录；英文内容由页面自动显示为中文 UI 标签，但原文仍为英文
- 证据：本轮 Playwright snapshot 文件保存在父工作区的 `.playwright-cli/`，文件名带时间戳；以下记录只摘录可核对事实

## Reddit 实测

### R1：Explorer 5000 Plus

固定入口 [Long review of Jackery Explorer 5000 plus](https://www.reddit.com/r/Jackery/comments/1rsrezk/long_review_of_jackery_explorer_5000_plus/) 实际可打开，页面标题和 `r/Jackery` 社区可见。正文包含：改装校车、Starlink、烹饪、太阳能、冷热环境、App 登录/联网、Bluetooth 自动关闭、设置重置和线缆短路更换。页面显示 9 票、18 条评论，评论区可读取。

实测判断：原始素材密度足够，适合保留。采集计划应保留正文和评论原话，不要把软件问题归纳为抽象“痛点”。

答案样本：`dataset/private/design-validation/rd-001.json`，保存了正文原文、作者、可见互动量和固定入口。

### R2：HomePower 3600 Plus UPS

固定入口 [Hp 3600 plus](https://www.reddit.com/r/Jackery/comments/1rr58wy/hp_3600_plus/) 实际可打开。正文原话描述：UPS 模式预期、电池在接墙时仍放电、需要拔插电源、App 中找不到 UPS mode。页面显示 3 票、10 条评论，评论区可读取。

实测判断：素材数量和主题集中度满足初始计划，适合保留。执行时应记录“观察到的行为”，不把它改写成已确认的技术故障。

答案样本：`dataset/private/design-validation/rd-002.json`，保存了正文原文、作者、可见互动量和固定入口。

### R3：2000 Plus 太阳能充电

固定入口 [Jackery 2000 plus solar charging](https://www.reddit.com/r/Jackery/comments/1si3ghc/jackery_2000_plus_solar_charging/) 实际可打开。正文包含 6 块 200W 面板、双输入、约 520W 充电、不同品牌面板混接等原始数字；页面显示 7 票、22 条评论。评论中可读取 Voc/Vmp/Imp/Isc 数值、520W 与 250W 实测、quiet charging 设置猜测等内容。

实测判断：素材密度足够，并且确实包含图片/接线讨论可能需要的视觉证据。但必须在冻结时选定这个固定帖子，不再与另一个太阳能帖子二选一；如果图片不再可见，应重写为纯文字字段。

答案样本：`dataset/private/design-validation/rd-003.json`，保存了正文原文和后续规格数字的原始表述。

### R4：竞品比较

固定入口 [2kwh power station - Bluetti, Ecoflow, or Jackey?](https://www.reddit.com/r/prepping/comments/1p8j8nb/2kwh_power_station_bluetti_ecoflow_or_jackey/) 实际可打开，页面标题和 `r/prepping` 社区可见。该入口适合采集容量、输出、价格、可靠性、扩展性和品牌选择标准的原话。

实测判断：原规格扩大到了 `r/CampingGear` 和 Anker，和该固定入口的原始竞品集合不一致；已改写为单一固定帖子、三品牌集合，设计期验证通过。

答案样本：`dataset/private/design-validation/rd-005.json`，保存了正文中的容量、输出、价格、空间限制和比较倾向原文。

### R5：价格、命名、兼容和售后（未纳入当前五题）

固定入口 [Jackery's Home Power Series](https://www.reddit.com/r/Jackery/comments/1u8sibx/jackerys_home_power_series_whats_new_whats/) 实际可打开，页面标题和 `r/Jackery` 社区可见，评论可读取。页面可作为型号命名、兼容性、扩展电池、折扣表达和售后讨论的原始素材入口。

实测判断：主题可采集，但冻结时需将“只采相关评论”的筛选规则写清楚，并保留被排除评论不计入数量的事实。

该入口作为候选调研素材保留，但当前五题配额已经由 RV/离网题和竞品比较题占用，因此没有把它混入已验证的 `rd-001` 至 `rd-005`。若后续需要扩展题库，应先为它建立独立规格和答案样本。

### Reddit 边界发现

直接打开 R1 的第一次会话曾返回 “Reddit - Prove your humanity”，旧版 Reddit 跳转到登录页；同一浏览器会话后续重新打开 R1、R2、R3、R4、R5 均成功。因此不能把单次访问成功当成稳定性保证。案例必须记录访问状态，且执行时不能因为被拦截就换社区或换帖子。

`r/Jackery/search` 的实际页面显示“来自所有 Reddit 社区”的搜索结果区，同时可见大量非 Jackery 社区条目。即使 URL 带 `restrict_sr=1`，执行仍必须逐条核验 `community == r/Jackery`；跨社区条目应记录为不符合范围，而不是当作 fallback 素材。

## Reddit 规格状态（复核后）

| 案例 | 固定入口 | 设计状态 | 实测可见素材 |
|---|---|---|---|
| RD-001 | `"Explorer 5000 Plus"` 精确短语搜索 | `validated` | 约 14 个可见结果，取前 10 |
| RD-002 | `Jackery solar charging` 搜索 | `validated` | 14 个可见结果，取前 10 |
| RD-003 | `Jackery review` 搜索 | `validated` | 10 个可见结果，取前 8 |
| RD-004 | `Jackery setup` 搜索 | `validated` | 7 个可见结果，取前 5 |
| RD-005 | `Jackery customer service` 搜索 | `validated` | 14 个可见结果，取前 10 |

表中的评论数是页面当次显示的总评论按钮值；正式采集仍需按每题的一级评论契约执行，并在输出中保留实际可访问数。

## Google SEO 实测

以下 15 个固定查询均通过真实浏览器打开，并显示 `Search Results` 与 `Page 2`：

| 案例组 | 实测查询 | 页面状态 | 混入模块 |
|---|---|---|---|
| SEO-001 | `Jackery HomePower 3600 Plus`；`Jackery 3600 Plus review`；`HomePower 3600 Plus specs` | 可访问，有分页 | 多数含 AI Overview 和视频；规格词未见 AI Overview，但仍有视频 |
| SEO-002 | `Jackery Explorer 5000 Plus`；`Explorer 5000 Plus review`；`Jackery 5000 Plus specs` | 可访问，有分页 | 均出现视频；前两个含 AI Overview |
| SEO-003 | `Jackery RV power station`；`portable power station for RV Jackery`；`Jackery RV setup` | 可访问，有分页 | 至少出现视频模块 |
| SEO-004 | `Jackery home backup 240V`；`Jackery transfer switch`；`Jackery whole home backup` | 可访问，有分页 | 前两个含 AI Overview；均出现视频 |
| SEO-005 | `Jackery vs EcoFlow vs Bluetti vs Anker`；`best portable power station Jackery EcoFlow Bluetti`；`2kWh portable power station comparison` | 可访问，有分页 | 第一个含 AI Overview，其余仍有视频 |

Google 页面实际还出现过 `People also search for`、YouTube、Facebook/Instagram、Shopping 和产品知识模块。页面存在第 2 页不等于首屏有 10 条可直接采集的自然结果；自然结果必须依据结果卡片的结构和来源类型识别，广告、AI Overview、视频、Shopping、People also search for、图片轮播和导航链接都应排除。进一步在 `2kWh portable power station comparison` 的真实页面上核验到：首屏可见的 h3 中有 AI Mode/AI replied 标题与有机结果混排，第 2 页仍能提供 9 个有标题和链接的有机网页卡片。因此 SEO 规格统一改为最多两页、按固定过滤规则采集前 10 条；不足时记录短缺，不填充模块。

### Jackery 官方页面实测

- [HomePower 3600 Plus](https://www.jackery.com/products/jackery-homepower-3600-plus)：可打开。首次出现 cookie consent，点击 “Allow all” 后可以读取产品规格和用户评价；页面有用户评价原文，例如 App 无蜂窝信号时连接困难、冰箱停电使用、地下室抽水泵等。
- [Explorer 5000 Plus](https://www.jackery.com/products/jackery-explorer-5000-plus)：可打开，页面标题为 “Jackery Explorer 5000 Plus | Essential Home Backup Power”。
- [HomePower 2000 Plus v2](https://www.jackery.com/products/homepower-2000-plus-v2)：可打开，页面标题为 “HomePower 2000 Plus v2 – Jackery”。

实测判断：SEO 案例确实能采集 SERP 元数据和打开页面原文，但 cookie consent、动态评价和 SERP 混排必须成为执行前提或显式证据字段。

## 冻结门槛

一个候选题只有同时满足以下条件才可将 `status` 改为 `frozen`：

1. 固定入口在真实浏览器中可打开，或失败状态已经被明确纳入答案契约。
2. 正文/结果卡片/评论能提供计划中的最低素材数量；不足就淘汰或重写，不在执行时 fallback。
3. 每条素材的来源社区、查询词、入口 URL、原文、时间和互动量可读取。
4. Google 题目能稳定区分自然结果与 AI/视频/广告/相关搜索模块。
5. 图片字段只在实际出现图片且案例要求时启用；视频不作为必采依赖。
6. 设计期实测结果已写回对应 JSON 的 `design_validation`，并由人工确认后再冻结。

本记录证明候选题目必须经过网站实测；它不替代后续正式 Browser Use 运行，也不构成最终 benchmark 答案。
