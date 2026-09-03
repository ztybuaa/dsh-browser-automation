# SEO Browser Use 案例复杂度调研（2026-09-03）

## 研究目标

本报告为海外营销背景的 Browser Use benchmark 寻找比“输入一个关键词、读取前几个网页”更有操作复杂度的 SEO 案例。候选案例必须同时满足：

1. 入口、查询词、地区、语言、设备、页数和素材数量可以在执行前冻结；
2. 页面选择可以由可见字段和固定算法决定，不依赖 agent 对“相关性”“优质内容”或营销结论的判断；
3. 输出仍是可复核的原始素材，不把浏览器采集和营销分析混成一个答案；
4. 结果不足、访问失败和动态模块可以如实记录，不能在执行时 fallback 到另一个查询、地区或对象。

本报告只提出候选规格和验证方法，不修改正式题目。候选题目在进入正式案例前仍须在真实 Google 页面上逐一验证。

## 一手依据

### 查询可以使用确定性的搜索运算符

Google Search Help 明确列出了精确短语、`site:`、排除词、`before:`、`after:` 和 `filetype:` 等运算符，并说明运算符和查询词之间不能有空格。该规则适合冻结查询字符串，而不是让 agent 自由改写关键词。

来源：[Refine Google searches](https://support.google.com/websearch/answer/2466433?hl=en)

同一文档也明确指出搜索过滤器及其顺序是动态的。因此 benchmark 不应把“点击某个固定位置的 Reviews/News/Shopping 过滤器”作为必经步骤；更稳妥的边界是固定 Google URL、只读取可识别的自然结果卡片，并把动态模块排除或仅作可选元数据。

### 标题和摘要是可观察的原始 SERP 素材

Google Search Central 说明标题链接由页面 `<title>`、主视觉标题、标题元素、`og:title`、锚文本和 `WebSite` structured data 等多种来源自动生成；摘要主要从页面正文生成，也可能使用 meta description，而且同一页面可能因查询不同显示不同摘要。这直接支持“跨查询保留同一 URL 的标题/摘要”这一类机械任务，但不支持把摘要当作稳定的页面摘要或要求 agent 重写摘要。

来源：[Influencing your title links in Google Search](https://developers.google.com/search/docs/appearance/title-link)

来源：[Control your snippets in search results](https://developers.google.com/search/docs/appearance/snippet)

### canonical 是可用于去重的页面证据，但不能替代原始 URL

Google 建议用 redirect、`rel="canonical"` 或 sitemap 表达重复/相似页面的首选 URL，并说明 canonical 是信号而不是绝对保证。benchmark 可以按“第一次出现的 destination URL”去重；若打开页面并能读取 canonical，则应同时保留原始 destination URL 和页面声明的 canonical，不能静默覆盖。

来源：[How to Specify a Canonical with rel="canonical" and Other Methods](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)

### 结构化数据可带来丰富展示，但展示不保证出现

Google 说明 Product、Review 等 structured data 可以让搜索结果包含价格、库存、评分、评论或 pros/cons，但 Search appearance 由系统决定，即使 markup 正确也不保证展示。因而适合作为“观察到哪些字段”的页面审计，不适合作为“必须出现星级/价格卡”的通过条件。

来源：[Introduction to structured data markup in Google Search](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)

来源：[Introduction to Product structured data](https://developers.google.com/search/docs/appearance/structured-data/product)

来源：[Review snippet structured data](https://developers.google.com/search/docs/appearance/structured-data/review-snippet)

### 图片搜索具有营销价值，但应采集可见字段而不是推断图片内容

Google 的图片 SEO 文档说明图片结果同样会生成标题链接和摘要，页面标题、meta 信息和 structured data 会影响图片搜索展示；图片 structured data 还可能带来更醒目的结果并驱动更有针对性的流量。适合固定图片查询并记录缩略图、链接页面和来源域名，图片视觉理解只有在案例明确要求时才加入。

来源：[Image SEO best practices](https://developers.google.com/search/docs/appearance/google-images)

### 账号数据不适合作为当前公开 benchmark 的默认入口

Search Console 的 Performance report 提供 clicks、impressions、CTR、query、page、country 等站点私有数据，Google 也建议按查询、页面和国家进行比较。这类数据的营销价值很高，但必须登录并拥有特定 property；不同账号的数据不可共享，无法作为当前公开、固定对象的默认案例。它可以保留为未来的私有/企业版 benchmark。

来源：[Using Search Console and Google Analytics data for SEO](https://developers.google.com/search/docs/monitor-debug/google-analytics-search-console)

Google Ads Keyword Planner 也要求完成账号设置并填写 billing information，结果依赖账户、位置、语言和历史数据。它适合作为受控账号实验，不适合作为本轮无账号依赖的公开题目。

来源：[About Keyword Planner forecasts](https://support.google.com/google-ads/answer/3022575?hl=en)

来源：[Refine your new keywords in Keyword Planner](https://support.google.com/google-ads/answer/6325025?hl=en)

## 候选案例类型

下表中的“固定规则”是可以直接写进 case specification 的操作规则，不是给 agent 的开放式建议。

| 候选 | 机械执行规则 | 必采原始字段 | 营销用途 | 复杂度 |
|---|---|---|---|---|
| 1. 单查询自然结果基线 | 固定 1 个查询；第 1 页不足时读第 2 页；按页面 DOM 顺序给自然结果编号；取前 10 条 | query、page、rank、title、snippet、visible domain、destination URL | 记录品牌/产品词的 owned、retailer、editorial、community 可见度 | L1 |
| 2. 搜索意图矩阵 | 固定 4 个查询字符串（brand、review、comparison、use-case）；按 query_set 顺序各取前 10 条自然结果；不按语义再次筛选 | query、rank、title、snippet、domain、URL、页面类型标签（来自冻结 host allowlist） | 比较不同意图下官方站、媒体、零售商和社区的曝光结构 | L2 |
| 3. 跨查询 URL 与摘要复用 | 执行固定查询集合；把所有自然结果按 destination URL 分组；只保留第一次出现顺序，同时保留该 URL 在每个查询下的原始 title/snippet | query、rank、URL、title、snippet、first_seen、appearance_count | 发现一个页面是否覆盖多种需求、不同查询触发的 messaging 是否一致 | L3 |
| 4. owned-vs-market SERP 对照 | 对每个主题执行一对固定查询：宽查询和带 `site:jackery.com` 的查询；分别取前 10 条，再按 URL 规范化做集合差异 | query_pair、rank、URL、title、snippet、domain、is_owned（冻结域名表） | 衡量品牌自有页面能否覆盖非品牌需求，以及竞品/第三方占位 | L3 |
| 5. 页面证据与 canonical 审计 | 先按固定 SERP 规则选前 5 个唯一 URL；依次打开；读取页面 title、首个可见 H1、canonical（若存在）、meta description 和可见产品/评分/价格字段 | SERP provenance、page title、H1、canonical URL/null、meta description、visible price/rating/availability/null、access_status | 检查搜索结果承诺与落地页证据是否一致，识别重复 URL 或商业信息缺口 | L4 |
| 6. Rich-result 可见字段审计 | 对固定查询的前 5 个唯一页面，仅记录搜索卡片或落地页上实际可见的 rating、review count、price、availability、pros/cons；不存在就写 null，不要求展示 | URL、observed_feature、raw_text、source_surface、null reason | 评估产品/评论结构化信息是否在用户决策入口可见 | L4 |
| 7. 图片 SERP 资产审计 | 固定 Google Images 查询和前 12 个图片卡片；按 DOM 顺序采集缩略图 URL、链接页 URL、来源域名、可见 alt/title；域名按冻结 allowlist 分类 | query、rank、thumbnail URL、landing URL、source domain、alt/title、image dimensions if visible | 比较官方、零售商、媒体和用户图片在视觉搜索中的占位，支持创意和素材策略 | L4 |
| 8. 文本 SERP + 图片 SERP 对照 | 对同一固定查询分别运行 Web 和 Images surface；各取固定数量；按 landing URL 关联两份记录，不对图片内容做开放式描述 | query、surface、rank、landing URL、source domain、raw title/alt、access_status | 找出在文字结果可见但图片结果缺席，或反之的内容机会 | L5 |

## 推荐的五级 SEO 复杂度梯度

若要把现在五个近似的 SEO 子任务改成同一大任务下的复杂度梯度，建议使用下面的五级结构。每一级的主题可以继续围绕 Jackery，但操作链路逐级增加；它们不需要把营销结论写进 Browser Use 答案。

### SEO-L1：自然结果基线

固定一个产品/品牌查询，采集前 10 条自然结果及其 title、snippet、domain、URL。只验证入口、卡片识别、模块排除和页码边界。

### SEO-L2：意图矩阵

固定四个查询字符串，逐查询采集前 10 条结果，并保留 query provenance。增加 query-set 循环和结果类型的冻结 host 分类，但不做语义筛选。

### SEO-L3：跨查询去重与摘要对照

在 L2 的结果上按 URL 去重，保存同一页面的多组 title/snippet 和出现次数。增加跨查询状态、顺序稳定性和原始摘要保存。

### SEO-L4：owned 对照与页面打开

对每个主题执行宽查询/`site:` 查询对；按冻结域名表计算 owned 标记；再打开前 5 个唯一 URL，读取固定页面字段和访问状态。任何页面阻塞都保留，不替换。

### SEO-L5：跨 surface 研究包

在固定 Web 查询之外增加固定 Images 查询，按 landing URL 关联文本和图片结果；同时保留页面 canonical、可见商业字段和缺失原因。图片只在题目声明时理解，视频只记录元数据。

## 必须冻结的执行规则

以下字段应在案例进入 validated 前写死：

- **环境**：`google.com`、国家、语言、桌面/移动、是否登录、个性化设置、运行日期记录。
- **查询**：完整字符串、顺序、是否包含引号/`site:`/排除词/日期运算符；执行时禁止改写或补充查询。
- **自然结果识别**：必须同时有可见标题、destination URL 和 visible domain；广告、AI Overview、People Also Ask、Shopping、News/Video/Image 模块按案例声明排除。
- **排序与页码**：同一页面使用 DOM 顺序；先 page 1 后 page 2；跨查询使用 `query_set` 顺序；不得按“相关性”重排。
- **去重**：默认按 destination URL 的规范化字符串去重；若读取 canonical，另存为页面字段，不覆盖 SERP 原始 URL。
- **域名分类**：提前给出完整 allowlist（例如 `jackery.com`、指定零售商、指定媒体、指定论坛）；未知域名统一 `other`，不让 agent 临时判断。
- **页面字段**：只采集题目列出的 title、H1、canonical、meta description、可见价格/评分/库存等字段；缺失写 `null` 并记录原因。
- **媒体**：只有 `image_required_when` 条件满足时采集图片；视频不做内容理解；图片结果字段也必须预先列出。
- **短缺与阻塞**：返回实际数量和 `shortfall`/`access_status`；不得换地区、换搜索引擎、换查询、换竞品或用后续结果补位。

## 不建议纳入当前公开 benchmark 的做法

1. **要求“找出最相关/最有价值/最适合 RV 的页面”**：这是语义判断，不是确定性操作。
2. **要求固定出现某个 SERP 模块或 rich result**：Google 明确说明过滤器顺序、标题/摘要和 structured-data 展示由系统自动决定，不能作为硬性通过条件。
3. **把 Search Console 或 Keyword Planner 的私有指标当作公开答案**：需要特定账号、property、billing 和历史数据，无法保证跨执行环境一致。
4. **执行时自由 fallback**：设计阶段可以淘汰素材不足的候选查询；冻结后必须报告不足，不能换主题。
5. **把“官方网页占比”直接写成 agent 结论**：Browser Use 只应返回 URL、域名、标题、摘要和预先定义的 `is_owned` 字段；占比计算属于评分器或后续营销分析。

## 结论与下一步

SEO 场景不必继续增加相似的关键词题目。更有区分度的做法是保留一个 SEO 顶层任务，下面按 L1-L5 增加状态和操作复杂度：从单查询自然结果，逐步扩展到多查询 provenance、跨查询 URL/摘要对照、`site:` 对照、页面字段审计，最后加入固定的 Images surface。

建议下一轮只挑其中一条候选链路做真实网站验证：优先验证 **L3 跨查询 URL/摘要对照** 和 **L4 owned-vs-market + 页面打开**。它们营销价值清晰、原始字段容易复核，也不会把 Google 不保证稳定的 rich-result 展示当成必需条件。L5 图片对照应在 Playwright 中确认图片卡片的可读字段和落地页链接足够稳定后再冻结。
