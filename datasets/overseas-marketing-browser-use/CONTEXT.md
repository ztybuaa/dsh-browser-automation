# 领域术语

**Benchmark question**：`dataset/questions.md` 中一段可独立交给被测 agent 的真实用户需求，是题目文本的唯一事实来源。

**Task ID**：一道题的稳定标识，例如 `rd-001` 或 `seo-001`。

**Task revision**：题目、选择规则或答案结构发生变化时递增的整数版本。

**Complexity level**：按浏览器操作链路标注的 L1 至 L5，只用于分层报告。

**Execution boundary**：题目中固定的网站、查询、排序、结果数量、页面范围、去重和禁止 fallback 规则。

**Raw marketing material**：帖子、评论、搜索结果、页面字段、URL 和图片可见事实等可核对素材。

**Marketing analysis**：基于原始素材形成的痛点、动机、定位或建议，不属于本 benchmark 的评分答案。

**Answer example**：`dataset/answer-examples/` 中只表示 JSON 结构的占位示例，不是 reference answer。

**Reference answer**：同一 task revision、环境和 reference window 下由参考采集器生成的隐藏答案。

**Run evidence**：一次执行保存的原始记录、来源、访问状态和采集时间。

**Design-stage fallback**：冻结题目前替换不合适候选主题的动作；执行题目时禁止 fallback。

**Environment-invalid task**：同一采集窗口内参考采集器也无法访问起始 surface 的题目；该次运行不计入成功率分母。
