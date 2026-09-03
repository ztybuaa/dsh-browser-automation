# 海外营销 Browser Use Benchmark 题目

本文件是 10 道 benchmark 题目的唯一来源。执行单题时，只向被测 agent 提供该题“题目”段落；链接的 JSON 只展示答案结构，不包含题目、评分规则或参考答案。

## Reddit

### RD-001 | L3 | Explorer 5000 Plus 用户原话与图片

**题目**

我正在为 Jackery Explorer 5000 Plus 的海外营销收集用户原话。请在桌面版 Reddit 的 `r/Jackery` 中，以 `Top`（中文界面为“最受欢迎”）、`Past year`（中文界面为“过去一年”）搜索精确短语 `"Explorer 5000 Plus"`，按搜索页显示顺序取前 10 个帖子；逐帖将评论排序设为 `Top`（“最受欢迎”），并按显示顺序取最多 3 条直接回复原帖的评论。最终返回按采集顺序排列的前 5 条评论及其评论 URL、帖子 URL；如果入选帖子或评论包含图片，再按出现顺序返回最多 3 张图片及图片中的可见事实。结果不足或页面不可访问时如实返回，不得更换查询、社区或结果，也不要总结营销结论。

答案格式：[rd-001.json](answer-examples/rd-001.json)

### RD-002 | L2 | 太阳能充电讨论原话

**题目**

我正在为 Jackery 太阳能充电教育内容收集用户讨论。请在桌面版 Reddit 的 `r/Jackery` 中，以 `Top`（中文界面为“最受欢迎”）、`Past year`（中文界面为“过去一年”）搜索 `Jackery solar charging`，按搜索页显示顺序取前 10 个帖子；逐帖将评论排序设为 `Top`（“最受欢迎”），并取最多 2 条直接回复原帖的评论。将采集到的评论按 Reddit 显示的评论 score 从高到低排序，同分时保持采集顺序，返回前 5 条评论的原文、score、评论 URL 和帖子 URL。结果不足或页面不可访问时如实返回，不得替换结果，也不要采集图片或总结营销结论。

答案格式：[rd-002.json](answer-examples/rd-002.json)

### RD-003 | L1 | 评测话题结果卡片

**题目**

我想查看 `r/Jackery` 中当前最靠前的 Jackery 评测话题。请在桌面版 Reddit 中，以 `Top`（中文界面为“最受欢迎”）、`Past year`（中文界面为“过去一年”）搜索 `Jackery review`，按搜索页显示顺序返回前 8 个帖子卡片的标题、帖子 URL 和 Reddit 显示的帖子 score。不要打开帖子、评论或媒体；卡片不足时返回实际数量，不得更换查询或社区。

答案格式：[rd-003.json](answer-examples/rd-003.json)

### RD-004 | L4 | 设置与客服两个素材入口

**题目**

我正在分别建立 Jackery 设置内容和客服沟通内容的素材入口。请在桌面版 Reddit 的 `r/Jackery` 中，以 `Top`（中文界面为“最受欢迎”）、`Past year`（中文界面为“过去一年”）依次搜索 `Jackery setup` 和 `Jackery customer service`。第一个查询按显示顺序取前 5 个帖子并读取每帖最多 3 条 `Top`（“最受欢迎”）排序下直接回复原帖的评论；第二个查询取前 10 个帖子并读取每帖最多 2 条同类评论。两个查询独立处理，最终分别返回各自前 3 个帖子 URL。结果不足或页面不可访问时如实返回，不得替换结果或合并两个查询。

答案格式：[rd-004.json](answer-examples/rd-004.json)

### RD-005 | L5 | 多查询去重与来源保留

**题目**

我需要建立一份可追溯的 Jackery Reddit 素材索引。请在桌面版 Reddit 的 `r/Jackery` 中，以 `Top`（中文界面为“最受欢迎”）、`Past year`（中文界面为“过去一年”）依次搜索 `Jackery setup`、`Jackery review`、`Jackery customer service`，每个查询按显示顺序取前 5 个帖子。按查询顺序合并这 15 个结果，以帖子 URL 去重并保留首次出现顺序，打开前 8 个唯一帖子并读取每帖最多 2 条 `Top`（“最受欢迎”）排序下直接回复原帖的评论。返回这 8 个帖子 URL，以及每个 URL 出现过的固定查询列表。结果不足或页面不可访问时如实返回，不得增加查询或替换帖子。

答案格式：[rd-005.json](answer-examples/rd-005.json)

## Google SEO

### SEO-001 | L1 | 两个型号的官网自然搜索占比

**题目**

我想比较 Jackery HomePower 3600 Plus 和 Explorer 5000 Plus 在 Google 自然搜索结果中的官网占比。请在关闭个性化的 Google US 桌面版 `Web`（英文或简体中文界面均可，搜索结果语言保持英文）中，依次运行 `Jackery HomePower 3600 Plus`、`Jackery 3600 Plus review`、`HomePower 3600 Plus specs`、`Jackery Explorer 5000 Plus`、`Explorer 5000 Plus review`、`Jackery 5000 Plus specs`。每个查询按页面显示顺序取前 10 条自然网页结果；第一页不足时继续第二页，排除广告、AI Overview、People Also Ask、购物、图片和视频模块。前三个查询归为 `homepower-3600`，后三个归为 `explorer-5000`；仅当结果卡片显示域名等于 `jackery.com` 或以 `.jackery.com` 结尾时计为官方结果。分别返回两组的官方结果数、自然结果总数和两者之比；结果不足时按实际数量计算，不得补充其他模块或查询。

答案格式：[seo-001.json](answer-examples/seo-001.json)

### SEO-002 | L2 | 搜索结果到落地页字段检查

**题目**

我想检查 Explorer 5000 Plus 搜索结果所指向页面的基础 SEO 字段是否存在。请在关闭个性化的 Google US 桌面版 `Web`（英文或简体中文界面均可，搜索结果语言保持英文）中，依次搜索 `Jackery Explorer 5000 Plus`、`Explorer 5000 Plus review`、`Jackery 5000 Plus specs`。每个查询按页面显示顺序取前 10 条自然网页结果；第一页不足时继续第二页，排除广告、AI Overview、People Also Ask、购物、图片和视频模块。按查询顺序和结果顺序合并并以目标 URL 去重，打开前 5 个唯一页面，返回每个 URL 及页面 title、首个可见 H1、canonical URL 和 meta description 是否存在。页面不可访问或字段缺失时如实返回，不得用后续结果替换。

答案格式：[seo-002.json](answer-examples/seo-002.json)

### SEO-003 | L3 | RV 主题结果页面访问

**题目**

我正在整理 Jackery 的 RV 供电搜索素材入口。请在关闭个性化的 Google US 桌面版 `Web`（英文或简体中文界面均可，搜索结果语言保持英文）中，依次搜索 `Jackery RV power station`、`portable power station for RV Jackery`、`Jackery RV setup`。每个查询按页面显示顺序取前 10 条自然网页结果；第一页不足时继续第二页，排除广告、AI Overview、People Also Ask、购物、图片和视频模块。按查询顺序和结果顺序合并并以目标 URL 去重，访问前 5 个唯一页面，按原顺序返回 URL 和访问状态。页面不可访问时保留该记录，不得用后续结果替换。

答案格式：[seo-003.json](answer-examples/seo-003.json)

### SEO-004 | L4 | 家庭备电主题结果页面访问

**题目**

我正在整理 Jackery 家庭备电、240V 和 transfer switch 相关的搜索素材入口。请在关闭个性化的 Google US 桌面版 `Web`（英文或简体中文界面均可，搜索结果语言保持英文）中，依次搜索 `Jackery home backup 240V`、`Jackery transfer switch`、`Jackery whole home backup`。每个查询按页面显示顺序取前 10 条自然网页结果；第一页不足时继续第二页，排除广告、AI Overview、People Also Ask、购物、图片和视频模块。按查询顺序和结果顺序合并并以目标 URL 去重，访问前 5 个唯一页面，按原顺序返回 URL 和访问状态。页面不可访问时保留该记录，不得用后续结果替换，也不要给出电气安装建议。

答案格式：[seo-004.json](answer-examples/seo-004.json)

### SEO-005 | L5 | 多品牌比较查询结果

**题目**

我想观察多品牌和品类比较词在 Google 自然搜索中的结果构成。请在关闭个性化的 Google US 桌面版 `Web`（英文或简体中文界面均可，搜索结果语言保持英文）中，逐字依次搜索 `Jackery vs EcoFlow vs Bluetti vs Anker`、`best portable power station Jackery EcoFlow Bluetti`、`2kWh portable power station comparison`。每个查询按页面显示顺序取前 10 条自然网页结果；第一页不足时继续第二页，排除广告、AI Overview、People Also Ask、购物、图片和视频模块。对每个查询分别返回实际取得的自然结果数及排名前 3 的目标 URL；同时按查询顺序合并全部结果、以目标 URL 去重并访问前 5 个唯一页面。不得改写查询、增加品牌、替换页面或输出品牌胜负。

答案格式：[seo-005.json](answer-examples/seo-005.json)
