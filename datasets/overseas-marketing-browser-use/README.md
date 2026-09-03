# 海外营销 Browser Use Benchmark

本仓库设计一组具有海外营销背景的浏览器 agent 测试题，测量 agent 在固定规则下发现网页、读取页面并提取可核对原始素材的能力。它不评价营销分析、文案创作或开放式结论。

## 当前版本

`v0.4.1` 是包含 10 道已做真实网站可行性验证的 pilot：5 道 Reddit 题和 5 道 Google SEO 题，每个平台覆盖 L1 至 L5 的操作复杂度。本版本仅更新界面标签兼容表述，不改变查询、筛选或答案契约。Google Trends、插件成本优化和内嵌浏览器实现不在本版本范围内。

## 阅读顺序

1. [questions.md](dataset/questions.md)：唯一题库，展示实际交给被测 agent 的中文题目。
2. [answer-examples](dataset/answer-examples)：每题最终 JSON 的格式示例，不是参考答案。
3. [EVALUATION.md](dataset/EVALUATION.md)：环境、live-web reference、指标和报告方法。
4. [dataset README](dataset/README.md)：数据集组成和公开/隐藏边界。
5. [PRD](docs/prds/overseas-marketing-browser-use-benchmark.md)：目标、范围和验收条件。

`dataset/private/`、`docs/research/` 以及历史验证材料不得提供给被测 agent。本次汇总没有包含源工作区的 `.playwright-cli/`、`runs/` 或 `checkpoints/`；研究文档中出现这些名称时，仅表示被排除的设计期证据位置。

## 核心原则

- 每道题以真实营销需求开场，但答案停留在原始网页素材或固定计算结果。
- 查询、来源、排序、数量、去重和禁止 fallback 的边界在题目中明确。
- 每题独立执行和评分；复杂度标签用于分层报告，不改变题目内容。
- live-web 答案按 task revision 和同一 reference window 保存，不把旧网页结果当作永久 gold。
- 评分使用 schema、选择顺序、原文一致性、来源 URL 和覆盖率等确定性检查，不使用 LLM judge。
- 本目录作为数据集发布到宿主仓库；不包含插件代码或其他宿主仓库文件。
