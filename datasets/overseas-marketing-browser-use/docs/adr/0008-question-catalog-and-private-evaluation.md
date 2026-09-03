# ADR-0008：中文题库与隐藏评估配置分离

- 状态：Accepted
- 日期：2026-09-03

## 背景

v0.3 的单题 JSON 同时保存题目、营销理由、执行规则、字段计划和验证记录，导致题目冗长且可能向被测 agent 泄漏评估信息。把题面同时维护在 Markdown 和 JSON 中也会产生漂移。

## 决策

`dataset/questions.md` 是唯一题库，以真实用户会提出的中文需求展示 10 道题。`dataset/answer-examples/` 只保存响应形状示例；响应 schema、隐藏 evaluator、设计验证和逐次运行产物各自独立。被测 agent 只接收一道题的正文，以及需要时对应的答案格式示例。

每道题使用一个 task ID 并独立评分。L1 至 L5 只作为复杂度标签，不再建立额外 task group 或 subtask 标识。

## 结果

- 题目不再包含营销 rationale、验证历史、reference answer 或评分细节。
- JSON 不再重复题面。
- Markdown 题库通过校验器与 task ID、答案示例、response schema 和隐藏 evaluator 对齐。
- 这一项目选择不同于常见的 JSONL-first 发布方式，但更贴合本 benchmark 模拟中文真实用户请求的目标。
