# 真实网站复核记录（2026-09-02）

## 目的

本轮复核针对题目从“固定单帖”改为“固定搜索规则、机械取样”后的可行性。使用真实 Chromium 浏览器打开 Reddit 搜索页和 Google SERP，检查查询是否产生足够可见结果、研究对象是否漂移、以及是否能在不依赖语义判断的情况下定义筛选边界。

本记录不是 Browser Use 插件测评，也不是最终 gold answer。它只决定题目能否进入下一轮设计。执行阶段仍禁止 fallback；结果不足时必须记录短缺或淘汰题目。

## Reddit 复核

| 案例 | 固定搜索入口 | 真实观察 | 当前结论 |
|---|---|---|---|
| RD-001 | `r/Jackery`，精确短语 `"Explorer 5000 Plus"`，`sort=top`，`t=year` | 精确短语页可见约 14 个结果，包含长评、保温、STS 和充电讨论；宽泛写法会混入 Explorer 2000、Plus 300 等型号。 | **已验证**。题目固定精确短语，取前 10 个社区内结果；不再按主题语义筛选。 |
| RD-002 | `r/Jackery`，`Jackery solar charging`，`sort=top`，`t=year` | 可见 14 个 r/Jackery 结果，包含 SolarSaga 安装、面板功率、车辆安装、充电和天气/保温讨论，分数和评论数均可见。 | **已验证**。取前 10 个结果；型号差异作为原始字段保留。 |
| RD-003 | `r/Jackery`，`Jackery review`，`sort=top`，`t=year` | 可见 10 个 r/Jackery 结果，包含 3600、5000、3000、客户服务和体验帖，分数、评论数和 permalink 可见。 | **已验证**。取前 8 个结果；不做情绪或型号语义过滤。 |
| RD-004 | `r/Jackery`，`Jackery setup`，`sort=top`，`t=year` | 可见 7 个 r/Jackery 结果，包含 SolarSaga tracker、3600 review、1000 Plus setup 和安装/功率讨论。 | **已验证**。取前 5 个结果；数量按实测上限固定，不足时记录短缺。 |
| RD-005 | `r/Jackery`，`Jackery customer service`，`sort=top`，`t=year` | 可见 14 个 r/Jackery 结果，包含 service、returns、support、firmware 和用户表扬/投诉，分数、评论数和 permalink 可见。 | **已验证**。取前 10 个结果；不做正负面语义筛选。 |

### Reddit 共同规则

- `restrict_sr=1` 的 Reddit 搜索页仍可能显示“来自所有 Reddit 社区”的结果；执行时必须逐条读取并记录 `community`，跨社区结果不计入集合。
- 结果不足不触发 fallback。应记录 `shortfall`，或在设计阶段淘汰/改写题目。
- 结果资格必须由可见字段定义，例如精确查询命中、社区、canonical permalink、可见 score/comment_count；不能用“关于可靠性”“适合家庭备电”等语义主题让 agent 自由判断。
- 旧的 `dataset/private/design-validation/rd-*.json` 是固定帖子设计期素材样本，只能证明页面有原始内容，不能证明新的搜索型题目已经通过验证。

## Google SEO 复核

15 个固定查询均在真实 Google US English 桌面会话中打开，并能访问第 2 页。以自然结果卡片的结构化标题/链接为资格条件后，首屏和第 2 页都能观察到足够的有机网页卡片；AI Overview、AI Mode、视频、Shopping、People Also Ask、图片轮播和相关搜索均可通过结构或模块标签排除。`2kWh portable power station comparison` 的首屏和第 2 页分别可见约 9 个有机网页卡片，跨两页足以执行“前 10 条自然结果”规则。

因此 SEO-001 至 SEO-005 当前保留为 `validated`。这不保证未来 SERP 永远不变；正式答案仍需保存每次查询的排名、标题、摘要、URL、可见域名和访问状态。

## 状态同步

本轮之后：

- Reddit `rd-001` 至 `rd-005` 已按本轮固定查询和结果数量改写，并通过设计期真实搜索复核；仍需在冻结前重新保存完整答案。
- SEO `seo-001` 至 `seo-005` 可保持 `validated`，但尚未冻结为永久答案。
- 本轮没有运行 Browser Use 插件，也没有提交 Git。下一轮应按新的搜索题面生成完整原始答案样本，再做冻结前复核。
