# 海外营销 Browser Use Benchmark PRD

## 目标

建立 10 道可重复执行的 live-web 题目，检验浏览器 agent 能否在固定边界内完成搜索、结果筛选、页面访问、原始素材读取和机械计算。题目具有明确营销用途，但不要求 agent 生成营销结论。

## 数据集组成

- Reddit：5 道题，覆盖结果卡片、评论读取、条件图片、双查询和跨查询去重。
- Google SEO：5 道题，覆盖官网占比、落地页字段、多查询、页面访问和比较词结果。
- 每个平台包含 L1 至 L5 五个复杂度等级。
- 当前 10 道题均进入 `test` split，数据集状态为 `pilot`。

## 题目接口

`dataset/questions.md` 是题目文本的唯一事实来源。每道题必须：

- 以真实用户的营销资料需求表达；
- 单独阅读即可执行；
- 明确网站、查询、排序、数量、去重、页面不可访问时的处理和最终返回内容；
- 只使用网站可识别术语，不使用项目内部自造操作名；
- 禁止执行时更换对象、查询、来源或结果；
- 不暴露 reference answer、evaluator、验证截图或设计期命中页面。

`dataset/answer-examples/*.json` 只给出响应结构。完整结构由 `dataset/schemas/responses.schema.json` 校验。隐藏选择规则和评分检查保存在 `dataset/private/`，不得提供给被测 agent。

## 评估

主指标是 task-level `success@1`，辅以 schema validity、selection accuracy、content fidelity、provenance validity 和 coverage。所有检查必须确定性执行，不使用 LLM judge。

live-web reference 必须和被测运行使用同一 task revision、环境配置及 reference window。参考采集器自身无法访问的题目记为 `environment_invalid`；参考成功而 agent 失败则记为任务失败。

## 验收条件

- `questions.md` 恰好包含 5 道 Reddit 和 5 道 Google SEO 题。
- 每题有唯一 task ID、revision、复杂度和 JSON 答案示例。
- 题目中不存在主观的“相关”“主要痛点”“高质量页面”等选择条件。
- 查询、顺序、数量、去重、shortfall 和禁止 fallback 规则可机械执行。
- 每题经过真实网站可行性验证；规则变化后重新验证并递增 revision。
- 公开题目与隐藏 evaluator 一一对应，且被测 agent 无法访问答案、验证资料和评分规则。
- 运行报告记录模型、harness、浏览器、工具权限、预算、时间、访问失败和逐题得分。

## 非目标

- Google Trends。
- 营销策略、用户画像、定位结论或文案生成。
- 视频内容理解。
- 插件代码质量评测、耗时/API 成本优化和内嵌浏览器实现。
- 把某次 Reddit 或 Google 结果作为永久不变的 gold answer。
- 在当前阶段提交或推送远端仓库。
