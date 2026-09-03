# SEO 候选真实网站验证记录（2026-09-03）

## 验证范围

本记录是设计期可行性验证，不是 Browser Use 正式评分。使用真实 Chromium，通过 `google.com` 的 US English、桌面、未登录入口打开固定 URL。只验证候选规则是否能机械执行；没有把 SERP 内容归纳成营销结论。

## L3：跨查询 URL/snippet 对照

固定查询集合：

- `Jackery vs EcoFlow vs Bluetti vs Anker`
- `best portable power station Jackery EcoFlow Bluetti`
- `2kWh portable power station comparison`

观察结果：

- 三个查询都生成了真实 Google Web results 页面和 Page 2 导航。
- 页面同时出现 AI Overview、视频/论坛等模块和自然结果；自然结果卡片能通过可见 `h3`、标题、visible domain、destination link 识别，动态模块可按固定排除规则处理。
- 自然结果卡片的链接以 Google `/goto` 形式承载目的地，但点击后可进入目标站点；卡片文本中可读取标题和摘要片段。
- 证据快照：`.playwright-cli/page-2026-09-02T17-44-08-012Z.yml`、`.playwright-cli/page-2026-09-02T17-44-23-139Z.yml`、`.playwright-cli/page-2026-09-02T17-44-35-476Z.yml`。

结论：L3 的“按 query_set 顺序展开、按 destination URL 首次出现去重、保留同一 URL 在各查询下的 title/snippet”具备真实页面可执行性。候选可以进入下一步案例规格设计，但仍需在规格中冻结 URL 规范化和模块排除字段。

### 四品牌 `vs` 查询的直接复核

2026-09-03 再次在真实 Google US English 桌面会话中逐字输入 `Jackery vs EcoFlow vs Bluetti vs Anker`。Google 接受了完整字符串，展示了 AI Overview、Web results、动态视频/论坛模块和 Page 2 导航；Web results 中出现了包含四个品牌的 Reddit、PowerGen Store、SunergyHub 等自然结果卡片。快照保存在 `.playwright-cli/page-2026-09-03T03-46-32-919Z.yml`。

这只能证明该字符串是可执行的搜索操作，不能证明 agent 可以或应该从页面推断“用户明确比较四个品牌”。因此正式题面只要求逐字输入和采集固定结构的自然结果，不要求判断比较意图、选赢家或替换查询。

## L4：宽查询与 `site:` 对照 + 页面字段

已打开的固定查询对：

- `Jackery home backup 240V` / `site:jackery.com home backup 240V`
- `Jackery transfer switch` / `site:jackery.com transfer switch`
- `Jackery whole home backup` / `site:jackery.com whole home backup`

观察结果：

- 每个已完成页面均有 Web results 和 Page 2；宽查询可能包含 AI/视频等混合模块，`site:` 查询仍可得到自然结果卡片，但结果数量和页面类型不同。两类差异适合按固定 URL 集合差异记录，而不是让 agent 判断“哪个更相关”。
- `site:jackery.com whole home backup` 的首个自然结果实际打开到 `https://www.jackery.com/pages/reliable-backup-power-during-outages`。真实页面可读取：`title=Home Battery Backup - Jackery`、`h1=Reliable Home Battery Backup`、canonical 为同一路径、以及 meta description。
- 证据快照：`.playwright-cli/page-2026-09-02T17-48-55-922Z.yml`、`.playwright-cli/page-2026-09-02T17-49-03-970Z.yml`、`.playwright-cli/page-2026-09-02T17-49-38-740Z.yml`、`.playwright-cli/page-2026-09-02T17-49-47-861Z.yml`、`.playwright-cli/page-2026-09-02T17-50-14-534Z.yml`、`.playwright-cli/page-2026-09-02T17-50-55-876Z.yml`。

结论：L4 的“宽查询/`site:` 查询对、固定域名 allowlist、前 5 个唯一 URL、页面 title/H1/canonical/meta description/可见商业字段”具备真实页面可执行性。Google 动态模块和页面脚本错误不能作为失败条件；应保留 `access_status` 和字段缺失原因。

## 尚未通过的部分

- 本轮没有把 L3/L4 直接改写成正式题目；这份记录只冻结验证证据，避免未经规格审查就扩大正式数据集。
- Web+Images L5 仍需单独验证图片卡片的落地页链接、可见 alt/title 和重复 URL 是否足够稳定；在验证前不纳入正式案例。
- `Search Console` 和 `Keyword Planner` 依赖私有账号/property，不纳入当前公开 benchmark。
