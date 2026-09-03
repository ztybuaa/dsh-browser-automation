# 实测答案样本

当前活动规格为数据集 v0.4；此前版本和重构前的混合式 case spec 保存在仓库根目录 `checkpoints/` 下。

这些 JSON 是 2026-09-02 使用真实 Chromium 会话打开固定入口后保存的设计期答案样本。它们保留网页上的原始英文正文、SERP 标题或可核对的页面事实，供题目审阅和后续 Browser Use 执行对照使用。

样本不是模型总结，也不是长期稳定的 gold answer。它们只证明候选查询和页面曾在真实浏览器中产生可用素材；正式执行以 `questions.md` 当前 revision 的规则为准。

`seo-live-check-2026-09-02.json` 保存了 15 个固定 Google 查询的查询级实测样本（每个查询一个记录，包含可见有机标题示例和被排除模块）。它不是每个查询完整的 10 条 SERP 输出；正式执行仍按案例规格生成完整答案。

`reddit-search-live-check-2026-09-02.json` 保存了改写后 5 个 Reddit 搜索题的查询级实测样本，包括可见结果数量、标题、部分 score/comment_count 和 permalink 示例。原有 `rd-001.json` 至 `rd-005.json` 仍是固定帖子设计期样本，作为历史证据保留，不应被当作新搜索题的 gold answer。

`access_status` 是当次访问结果。若后续实测出现 blocked、deleted 或 partial，应新增带时间戳的样本，不覆盖历史证据。

正式运行时，长原始素材写入 `runs/<release>/<run_id>/<task_id>/evidence.json`，agent 最终只返回题目和 response schema 规定的紧凑 JSON。
