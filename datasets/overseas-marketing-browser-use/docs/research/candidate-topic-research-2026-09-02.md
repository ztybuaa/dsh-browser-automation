# 候选主题设计期研究（2026-09-02）

## 研究目的与边界

本记录用于在冻结 benchmark 案例前，验证 Jackery 优先产品池和五个 Reddit、五个 Google SEO 方向是否有足够的可核对原始素材。它是设计期可行性研究，不是 Browser Use 正式测评，也不产生插件能力评分。

研究时间为 2026-09-02（Asia/Shanghai）。网页内容、搜索排名和 Reddit 帖子状态会变化；本文的“已验证”只表示在该日期能看到对应页面或帖子，不表示执行日一定仍存在。

证据优先级如下：

1. Reddit 原帖和评论（用户原话、投票、时间、图片附件）。
2. Jackery 官方产品页、知识库和购买指南（品牌自有内容和规格边界）。
3. Google 搜索结果页（执行时作为 SERP 原始证据；本轮仅验证候选查询是否有可追踪的官方内容，不把搜索引擎摘要当作固定答案）。

“素材密度”是对可见页面中可采集字段数量和讨论层次的设计期判断，不是统计学样本量。最终案例仍需人工打开固定入口，确认帖子没有被删除、折叠或改版后才能冻结。

## Jackery 产品池核对

以下产品事实来自飞书多维表 `01-产品-v2`，并用公开官方页面做了交叉核对。多维表中的兼容性和规格边界应作为案例规格的产品事实来源；网页采集只回答案例要求的原始材料，不让 Browser Use 自行推导“适合谁”。

| 产品 | 设计期可用的固定事实 | 适合的营销素材方向 |
|---|---|---|
| HomePower 2000 Plus v2 | 2048Wh、2400W、可扩展至 12kWh、LiFePO4、支持太阳能和 600W DC-DC 交替充电；电池包只兼容本型号 | 停电优先级、RV/户外使用、充电方式、扩展兼容性 |
| HomePower 3600 Plus | 3584Wh、3600W、约 30dB、<10ms UPS、可扩展至约 21kWh；有 TT-30 和 120/240V 组合方案 | UPS/家庭备电、RV 供电、扩容和太阳能套装 |
| HomePower 3600 Pro Max | 3584Wh、120/240V、4000W；可与 Battery Pack 3600、MTS、40A 线缆组合 | 自动/手动转移开关、全屋备电定位 |
| Explorer 5000 Plus | 5040Wh、7200W、120/240V、0ms UPS、可接 60A Smart Transfer Switch | 大负载家庭备电、真实使用体验、App/连接痛点 |

产品页（已验证）：

- [HomePower 2000 Plus v2](https://www.jackery.com/products/homepower-2000-plus-v2?variant=43957143306327)
- [HomePower 3600 Plus](https://www.jackery.com/products/jackery-homepower-3600-plus)
- [HomePower 3600 Pro Max](https://www.jackery.com/products/jackery-homepower-3600-pro-max)
- [Explorer 5000 Plus](https://www.jackery.com/products/jackery-explorer-5000-plus)

## 候选矩阵

评分含义：高/中/低是设计期判断；“固定边界”描述冻结时应写入案例规格的最小边界，不是执行时可以临时放宽的范围。

### Reddit 候选

| ID | 核心营销问题（只保留一个） | 固定对象和入口草案 | 原始素材密度 | 图片/视频依赖 | 结论 |
|---|---|---|---|---|---|
| R1 | 真实用户把 Explorer 5000 Plus 用在什么场景，并如何评价软件体验？ | `r/Jackery`；固定帖子 `1rsrezk`；正文 + 按 Top 排序前 10 条一级评论 | 高：正文同时有 RV/Starlink/烹饪/停电使用和 App、Bluetooth、固件问题，评论有补充和反例 | 低；文字为主，图片不是必要字段 | **保留**，适合“使用场景与信息传达”素材 |
| R2 | HomePower 3600 Plus 的 UPS 预期与实际故障讨论是什么？ | `r/Jackery`；固定帖子 `1rr58wy`；正文 + Top 前 8 条一级评论 | 中高：正文和评论围绕 UPS 模式、电池放电、App 设置，讨论链短但主题集中 | 低；不依赖视频或图片 | **保留**，适合“购买后疑虑/支持内容”素材 |
| R3 | 2000 Plus 用户如何讨论太阳能板组合、输入限制和充电表现？ | `r/Jackery`；候选固定帖子 `1si3ghc`（充电功率）或 `1r0l46b`（双 500X）；需人工二选一后冻结 | 高：有额定电压、电流、输入功率、混接、MPPT 争论和实测数字 | 中：帖子含接线/面板图片；若规格图不可读则案例必须改为文字证据 | **暂保留**，冻结前必须确认选定帖子和至少 6 条可见评论 |
| R4 | 在非品牌社区，用户如何把 Jackery 与 EcoFlow/Bluetti 比较并表达购买理由？ | `r/prepping`；固定帖子 `1p8j8nb`；正文 + Top 前 10 条一级评论；竞品集合固定为 Bluetti Elite 200 V2、EcoFlow Delta 3 Max、Jackery E2000 Plus | 高：正文给出容量/输出/价格比较，评论提供可靠性、扩展、价格和长期使用观点 | 低至中；主要文字，可能有产品图但不作为必采字段 | **保留**，适合“竞品认知/异议原话”素材 |
| R5 | Jackery 用户对价格透明度、型号命名、兼容性和售后支持有哪些直接抱怨？ | `r/Jackery`；固定帖子 `1u8sibx`（Home Power 系列问答）；正文 + Top 前 10 条一级评论；只采与价格/兼容/支持相关的原话 | 高：评论出现型号混淆、价格折扣表达、扩展电池兼容、售后态度等多类原话 | 低；视频不是必要条件 | **保留**，适合“转化阻力与 FAQ 话术”素材 |

#### Reddit 来源与核对事实

- R1：[Long review of Jackery Explorer 5000 plus](https://www.reddit.com/r/Jackery/comments/1rsrezk/long_review_of_jackery_explorer_5000_plus/)（已验证：正文提到改装校车、Starlink、烹饪、太阳能，以及 App 必须联网、Bluetooth 失效、设置重置；评论有 UPS 和 Wi-Fi 反例）。
- R2：[Hp 3600 plus](https://www.reddit.com/r/Jackery/comments/1rr58wy/hp_3600_plus/)（已验证：正文描述插墙时电池仍放电、找不到 UPS mode；评论讨论电池保护设置和 700–800W 负载）。
- R3：[Jackery 2000 plus solar charging](https://www.reddit.com/r/Jackery/comments/1si3ghc/jackery_2000_plus_solar_charging/)、[2x SolarSaga 500's into Jackery HP 3600+?](https://www.reddit.com/r/Jackery/comments/1r0l46b/2x_solarsaga_500s_into_jackery_hp_3600/)（已验证：可见充电瓦数、电压/电流、面板混接和输入端争论；部分评论带图片，需冻结前复核图片是否仍可见）。
- R4：[2kwh power station - Bluetti, Ecoflow, or Jackey?](https://www.reddit.com/r/prepping/comments/1p8j8nb/2kwh_power_station_bluetti_ecoflow_or_jackey/)（已验证：正文列出三款容量、输出、价格和空间约束；评论包含可靠性、太阳能、扩展和品牌偏好）。
- R5：[Jackery's Home Power Series: What's new, what's changed, and who they're for](https://www.reddit.com/r/Jackery/comments/1u8sibx/jackerys_home_power_series_whats_new_whats/)（已验证：正文和 Jackery Team 回复讨论型号兼容、低温、扩展电池；评论明确抱怨命名、折扣表达和价格透明度）。

Reddit 方向的共同执行边界建议：英文原文；固定 subreddit、帖子 URL、评论排序（Top）、一级评论层级、绝对抓取日期；每条素材保存作者显示名、发布时间、投票数、原文、永久链接和是否含图片。不要因为帖子不足而换 subreddit 或换产品；不足应记录为失败证据。

### Google SEO 候选

SEO 案例的核心答案应是固定查询下的自然结果列表和打开后的页面原文/元数据。排名和结果数只在指定日期、地区、语言、登录状态和设备环境下有效；本轮没有把搜索摘要或第三方排名当成稳定事实。

| ID | 固定查询草案（英文） | 固定对象/页面边界草案 | 已验证的一手素材 | 密度与风险 | 结论 |
|---|---|---|---|---|---|
| S1 | `best portable power station for RV` | Google US/English；自然结果前 10；只记录结果页标题、URL、排名，再打开前 5 个可访问页面 | [RV Power Setup Guide](https://www.jackery.com/blogs/knowledge/rv-power-setup-guide-portable-power-station-vs-built-in-generator)、[2000 Plus v2 RV guide](https://www.jackery.com/blogs/knowledge/how-to-use-the-jackery-homepower-2000-plus-v2-for-home-outdoor-and-rv-life)、[RV collection](https://www.jackery.com/collections/portable-power-stations-for-rv) | 高；官方内容覆盖 RV、噪声、空调、充电和产品选择；SERP 变化风险高但可用绝对日期控制 | **保留** |
| S2 | `HomePower 2000 Plus v2 home backup` | Google US/English；前 10 自然结果；重点打开官方产品页和前 4 个相关页面 | [HomePower 2000 Plus v2 product](https://www.jackery.com/products/homepower-2000-plus-v2?variant=43957143306327)、[Home backup upgrade guide](https://www.jackery.com/blogs/buying-advice/how-to-upgrade-your-home-power-system-with-jackery-homepower-2000-plus-v2)、[what can it run](https://www.jackery.com/blogs/knowledge/what-can-jackery-homepower-2000-plus-v2-run-emergency-home-backup-or-rv-living) | 高；产品名精确，官方页面多，页面字段（标题、规格、FAQ、图片 alt）明确 | **保留** |
| S3 | `Explorer 5000 Plus 240V UPS transfer switch` | Google US/English；前 10 自然结果；固定采集 0ms UPS、120/240V、STS 相关页面 | [Explorer 5000 Plus product](https://www.jackery.com/products/jackery-explorer-5000-plus)、[Solar Generator 5000 Plus](https://www.jackery.com/products/jackery-solar-generator-5000-plus) | 中高；官方页同时提供 0ms、120/240V、Smart Transfer Switch 和 4000W solar；长尾词可能结果少，冻结前要确认至少 5 个可访问自然结果 | **暂保留**，需要设计期复核结果数量 |
| S4 | `HomePower 2000 Plus v2 solar charging alternator charger` | Google US/English；前 10 自然结果；打开官方充电指南、RV 指南和产品页，记录五种充电方式及可见规格原文 | [How to charge via different methods](https://www.jackery.com/blogs/knowledge/how-to-charge-the-jackery-homepower-2000-plus-v2-via-different-methods)、[Home/outdoor/RV guide](https://www.jackery.com/blogs/knowledge/how-to-use-the-jackery-homepower-2000-plus-v2-for-home-outdoor-and-rv-life)、[product page](https://www.jackery.com/products/homepower-2000-plus-v2?variant=43957143306327) | 高；官方页面明确 AC、太阳能、车充、DC-DC 交替充电和时间规格；适合采集原文而不要求计算结论 | **保留** |
| S5 | `Jackery vs EcoFlow portable power station` | Google US/English；前 10 自然结果；竞品集合固定为 Jackery、EcoFlow、Bluetti；打开结果页可访问内容并保留来源类型 | [Jackery 2kWh comparison guide](https://www.jackery.com/blogs/buying-advice/jackery-homepower-2000-plus-v2-vs-explorer-2000-plus-vs-explorer-2000-v2-which-should-you-buy)、[Jackery vs Solar Generator bundle](https://www.jackery.com/blogs/buying-advice/jackery-homepower-2000-plus-v2-vs-jackery-solar-generator-homepower-2000-plus-v2-key-differences) | 中；竞品查询通常有大量第三方页面，但结果质量和品牌覆盖不稳定；必须固定结果数、自然结果规则和日期，不把第三方结论改写成营销判断 | **暂保留**，若人工复核后不足 5 个可访问结果则改写为更具体的 `Jackery Explorer 2000 Plus vs EcoFlow Delta 2 Max` |

#### SEO 方向已验证事实

- S1 官方 RV 指南明确讨论便携电源与内置发电机、房车空调和安静/燃油取舍；2000 Plus v2 指南给出 RV 冰箱、咖啡机、风扇、空调、电视等页面级原文和运行时间示例。
- S2 官方产品和购买指南明确给出 2048Wh、2400W、可扩展 12kWh、6000 次循环、Priority Routing、30dB 等字段，可直接作为 SEO 页面素材，不需要 Browser Use 计算“能撑多久”。
- S3 Explorer 5000 Plus 官方页明确给出 5040Wh、7200W、120/240V、0ms UPS、Smart Transfer Switch、4000W solar 等卖点；这些是品牌原文，不能与 Reddit 用户体验混为同一证据层。
- S4 官方充电指南明确列出 AC、太阳能、燃气发电机、车充和 DC-DC 交替充电五种路径；RV 指南给出 600W 交替充电和约 3.8 小时等产品声明。
- S5 官方购买指南已有同品牌 2kWh 型号比较和独立套装差异页面，说明该查询确有品牌自有 SEO 素材；但 EcoFlow/Bluetti 的官方结果覆盖量尚未在本轮冻结，不能宣称 SERP 平衡。

## 淘汰、保留与设计期 fallback

### 当前保留

R1、R2、R4、R5 的入口和讨论主题已经有可见原帖，适合先进入案例规格草案。R3 需要在两个太阳能讨论帖之间做人工选择；选择后 URL 固定，执行时不允许二选一。

S1、S2、S4 的官方页面密度和营销用途最清晰。S3、S5 保留为长尾/竞品方向，但必须在冻结前用同一 Google 环境做一次“结果数 + 可访问页面数”核对。

### 尚未淘汰但有条件的候选

- R3：若指定帖子中的关键图片或评论在冻结时不可见，应改写为纯文字的输入限制/充电数字采集；不得在执行时临时换帖子。
- S3：若精确查询在固定地区只返回少于 5 个可访问自然结果，应把查询改为 `Explorer 5000 Plus home backup 120V 240V`，并重新记录 fallback。
- S5：若竞品比较结果被单一品牌或广告结果占满，应改为更窄的型号对比查询，并固定竞品集合。

### 明确淘汰的方向

- Google Trends 相关案例：结果漂移与时间/地区/个性化耦合过强，已按用户决定废弃，不进入本批 benchmark。
- 依赖视频内容理解的 Reddit/SEO 主题：本版媒体边界只允许按要求理解图片；视频最多记录可见标题/缩略图元数据，不能把视频转写或内容结论作为必采字段。
- “让 Browser Use 直接总结痛点/定位/购买建议”的题目：这会把营销分析结论混入原始答案，不符合 raw marketing material 约束。

## 冻结前人工确认项

1. 对 R3 在 `1si3ghc` 和 `1r0l46b` 中选定一个固定帖子，确认正文、至少 6 条一级评论和所需图片仍可见。
2. 在同一 Google US/English、未登录或固定登录状态、固定桌面设备和固定抓取日期下，逐一核对 S1-S5 的自然结果数量；广告、People Also Ask、视频轮播是否排除要写进案例规格。
3. 为每个案例写明素材计划（例如正文 1 条、一级评论 8/10 条、SEO 结果 10 条、打开页面 5 条）以及字段：原文、作者/站点、时间、投票或排名、URL、图片证据规则。
4. 确认执行时只用英文原文；中文翻译若保留，必须是独立附加字段，不能替代英文原话。
5. 确认 Reddit 登录、地区访问和折叠评论的操作前提；若页面需要登录，不改变固定对象和来源边界。
6. 将以上人工确认结果写入各自的 case specification 后再冻结；冻结后任何素材不足都应记录为不足，不允许 runtime fallback。

## 证据与不确定性声明

本文引用的 Reddit 内容和 Jackery 页面均为 2026-09-02 可访问时的原始 URL。帖子内容、评论排序、页面价格和搜索排名都可能变化；除官方产品规格外，不应把本文的数量判断当作长期事实。所有“保留”结论是设计期候选建议，最终是否进入 benchmark 以冻结前人工复核为准。
