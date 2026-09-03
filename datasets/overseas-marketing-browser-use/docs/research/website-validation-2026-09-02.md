# 网站实际检查记录（2026-09-02，历史版本）

> 本文记录的是上一轮固定帖子设计期检查，已被 [`revalidation-2026-09-02.md`](revalidation-2026-09-02.md) 的搜索型题目复核 supersede。固定帖子链接和原始素材仍保留作证据，不代表当前执行题面。

## 目的与边界

本记录回答一个前置问题：候选 benchmark 题目是否真的能在对应网站上看到足够的原始素材。检查由人工打开 Reddit 原帖、评论页面和 Google 查询结果完成，属于题目冻结前的设计验证，不是 Browser Use 插件测评，也不是最终答案集。

检查结果只证明页面在 2026-09-02 当天可见。帖子状态、评论排序、Google 结果和页面内容可能变化，因此任何题目在 `status` 改为 `frozen` 前都必须重新检查并记录入口、环境和抓取时间。

## Reddit 实际检查

| 候选 | 实际打开页面 | 看到的原始素材 | 设计判断 |
|---|---|---|---|
| R1 / rd-001 | [Explorer 5000 Plus 长评](https://www.reddit.com/r/Jackery/comments/1rsrezk/long_review_of_jackery_explorer_5000_plus/) | 正文包含改装校车、Starlink、烹饪、冰箱/柴油加热器、App 登录、联网、Bluetooth、设置重置和线缆短路；页面显示 Top/Best/New 等评论排序，并有多条一级评论和回复。 | **可保留**。使用场景和软件摩擦都能从原文与评论直接采集，不需要推导营销结论。冻结前应把该帖作为固定入口，而不是只用宽泛搜索页。 |
| R2 / rd-004 | [HomePower 3600 Plus UPS](https://www.reddit.com/r/Jackery/comments/1rr58wy/hp_3600_plus/) | 正文明确描述插墙时电池放电、找不到 UPS mode；可见评论讨论默认行为、设置和 700-800W 负载。页面可访问，但讨论链短，当前可见一级评论数量少于 R1。 | **有条件保留**。题目成立，但“5-10 条帖子 + 10-20 条评论”的计划不能从当前固定帖直接推出；需要在设计阶段改为单帖深采集，或换成一个已核实的固定帖子集合。 |
| R3 / rd-003 | [2000 Plus 太阳能充电](https://www.reddit.com/r/Jackery/comments/1si3ghc/jackery_2000_plus_solar_charging/)；[两块 SolarSaga 500 接入讨论](https://www.reddit.com/r/Jackery/comments/1r0l46b/2x_solarsaga_500s_into_jackery_hp_3600/) | 第一帖可见电压、电流、面板混接和约 520W 输入等用户实测；第二帖可见双输入、并联电压和 41V 讨论，并出现图片入口。 | **有条件保留**。素材密度和视觉测试价值足够，但两个帖涉及的型号并不完全一致；必须二选一并统一固定产品，不能把两帖拼成一个执行对象。 |
| R4 / rd-005 | [r/prepping 2kWh 比较](https://www.reddit.com/r/prepping/comments/1p8j8nb/2kwh_power_station_bluetti_ecoflow_or_jackey/) | 正文和 Top 评论可见 Bluetti、EcoFlow、Jackery 的购买理由、功率优先级、折扣、二手价格和房车使用讨论。 | **可保留**。适合采集竞品比较原话；若要加入 Anker 或 `r/CampingGear`，必须作为设计期改写重新核查，不能在执行期扩展。 |
| R5 / rd-005（价格/命名候选） | [Home Power Series 社区帖](https://www.reddit.com/r/Jackery/comments/1u8sibx/jackerys_home_power_series_whats_new_whats/) | 正文是 Jackery Team 对 HomePower 系列的产品说明；评论可见型号噪声、折扣透明度、广告疲劳、授权经销商价格和竞品流失等直接表述。 | **可保留**。营销素材非常直接，但来源包含品牌官方发帖和用户评论；规格必须区分两种来源，不应把官方说明当作消费者原话。 |

### Reddit 结论

- R1、R4、R5 具备清晰的原文和评论层次，可进入下一轮冻结前复核。
- R2 不能仅凭当前固定帖满足原计划的评论数量，必须改写采集计划或换固定入口。
- R3 必须在两个真实帖子中固定一个，并解决“HomePower 2000 Plus v2”与其他 2000/3600 型号的对象一致性。
- Reddit 搜索排序不是固定答案。冻结时应优先记录固定 permalink、评论排序和可见评论范围；不能只保留 `/search/` 根入口。

## Google 实际检查

本轮通过实际查询结果确认候选主题存在可访问的页面和多种页面类型。查询接口返回的结果不是指定 Google US/English/desktop 环境下的最终 SERP，因此下表只用于判断“题目值得进入冻结复核”，不作为排名答案。

| 候选 | 实际可见结果 | 设计判断 |
|---|---|---|
| S1 / seo-001 | `Jackery HomePower 3600 Plus` 查询返回 Jackery 官方产品页、官方 FAQ、评测页、手册和 Reddit 讨论；官方页可见价格、容量、120/240V、RV 插口、App 和 MTS 信息。 | **可保留**。页面类型和原文密度足够；冻结时固定 Google 环境并记录实际前 10 条自然结果。 |
| S2 / seo-002 | `Jackery Explorer 5000 Plus` 查询返回官方产品/FAQ、用户手册、评测和 Reddit 讨论；官方 FAQ 可见 5040Wh、4000 cycles、PV 输入等规格。 | **可保留**。型号词有足够结果，但需在指定环境排除广告、视频和非自然模块。 |
| S3 / seo-003 | `Jackery RV power station`、`portable power station for RV Jackery` 和 `Jackery RV setup` 返回 Jackery RV 集合、RV 指南、RV generators 页面以及第三方 RV 评测。 | **可保留**。RV 场景页面充足，适合采集结果标题、摘要、URL 和打开页面原文。 |
| S4 / seo-004 | `Jackery home backup 240V` 和 `Jackery transfer switch` 返回官方 HomePower/Explorer 页面、Transfer Switch 产品集合、用户手册、Reddit 讨论和第三方页面；官方 FAQ 明确区分单机和并联 240V 条件。 | **可保留但需谨慎**。技术限制和资格条件必须保留原文，不能在答案中自行解释电气含义。 |
| S5 / seo-005 | `Jackery vs EcoFlow portable power station` 和相关查询返回大量比较页、TechRadar 等评测、Reddit 比较讨论和 Jackery 自有比较指南。 | **有条件保留**。比较素材密度高，但结果质量和品牌覆盖不均；冻结前必须核对前 10 条自然结果中至少有 5 个可访问、且不被单一品牌占满。 |

### Google 结论

- S1、S2、S3、S4 目前都有真实可访问页面，具备进入固定 SERP 复核的条件。
- S5 有结果，但“比较页很多”不等于结果可比；需要固定品牌集合、自然结果规则和页面可访问下限。
- Google 查询的日期字段应解释为“检查/采集时间”，而不是声称 Google 能稳定提供一个绝对内容日期窗口。
- 任何 SEO 题目冻结前都需要保存实际 SERP 快照或逐条记录排名、标题、摘要、URL 和访问状态。

## 冻结门槛

题目只有同时满足下列条件才允许把 JSON 的 `status` 改成 `frozen`：

1. 人工打开固定入口，确认正文/结果页可访问。
2. 按案例规格的素材计划实际数一遍帖子、一级评论或自然结果。
3. 核对固定对象、型号、社区、查询词和来源边界没有漂移。
4. 记录阻塞、删除、折叠和不足，不用其他对象或来源补齐。
5. 把本记录中的条件候选改写结果同步到对应 case JSON 后，再做一次 `dataset/validate.ps1`。

本轮没有冻结任何题目，也没有运行 Browser Use 正式测试。
