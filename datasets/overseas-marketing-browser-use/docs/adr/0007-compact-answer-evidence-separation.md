# ADR-0007：紧凑最终答案与原始 evidence 分离

- 状态：Accepted
- 日期：2026-09-03

## Context

Browser-agent benchmark 的 agent-facing 任务应简洁，最终答案应可机器校验。完整网页正文、评论、SERP 卡片和页面摘录又必须保留，才能审计 live-web 漂移和原始证据。

## Decision

每道题在 `questions.md` 中定义最终返回内容，并在 `answer-examples/` 和响应 schema 中定义紧凑 JSON 结构。完整原始资料由 harness 写入每次运行的 `evidence.json`。题面不要求摘要、推理、营销结论或自由语义筛选。

## Consequences

- 评分可以比较比例、计数、布尔字段、短评论或固定 URL 列表。
- 原始内容仍可用于复核，但不会让最终响应变成长文本。
- 响应 schema 或选择规则变化时必须递增 task revision，并重新进行真实网站设计验证。
