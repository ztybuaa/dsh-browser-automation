# 研究文档

本目录保存案例选择、题目可行性验证和来源研究记录。

- `case-selection-method.md`：候选主题如何验证、fallback 如何记录以及何时冻结案例。
- `benchmark-format-research-2026-09-03.md`：基于 WebArena、BrowserGym、AssistantBench、OSWorld-V2 和 simple-evals 官方资料的题面、答案与运行产物格式研究。
- `benchmark-task-packaging-research-2026-09-03.md`：公开题面、隐藏规格和运行产物的封装边界复核。
- `scientific-benchmark-protocol-research-2026-09-03.md`：dataset card、live-web reference、确定性指标、运行报告和泄漏控制研究。

研究记录应区分设计期候选探索与冻结后的执行规格，不把未确认的候选清单当作正式 benchmark 案例。
# Research Notes

Research notes distinguish exploratory design evidence from frozen benchmark answers.

- [Case selection method](case-selection-method.md): feasibility checklist and design-stage fallback rules.
- [Candidate topic research (2026-09-02)](candidate-topic-research-2026-09-02.md): Jackery product verification, Reddit/SEO candidate matrix, source anchors, density judgments, and freeze checklist.
- [Benchmark freeze-readiness test (2026-09-02)](benchmark-freeze-readiness-2026-09-02.md): Real-browser checks of Reddit posts/search and all 15 fixed SEO queries, including access barriers and mixed SERP modules.
- [Website validation (2026-09-02)](website-validation-2026-09-02.md): actual page checks for Reddit posts/comments and Google query discoverability before case freeze.

The research notes do not change the execution boundary by themselves. A case becomes executable only after its case specification is reviewed and its `status` is changed to `frozen`.
