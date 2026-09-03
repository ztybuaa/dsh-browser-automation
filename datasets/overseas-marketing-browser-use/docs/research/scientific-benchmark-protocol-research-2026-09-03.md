# 科研 benchmark 发布与报告协议复核（2026-09-03）

## 研究范围与一手来源

本记录只复核 browser / computer-use benchmark 的科研发布与运行规范，重点是 dataset card、task split/status、live-web ground truth、确定性 metrics、run reporting 和 leakage controls。资料来自官方文档、官方代码和第一方 benchmark 页面：

- [Hugging Face Dataset Cards](https://huggingface.co/docs/hub/datasets-cards)
- [WebArena-Verified data format](https://servicenow.github.io/webarena-verified/dev/getting_started/data_format/)
- [WebArena-Verified usage and output files](https://servicenow.github.io/webarena-verified/getting_started/usage/)
- [WebArena-Verified removing LLM-based evaluation](https://servicenow.github.io/webarena-verified/evaluation/removing_llm_based_evaluation/)
- [WebArena-Verified quick start](https://servicenow.github.io/webarena-verified/)
- [BrowserGym `AbstractBrowserTask`](https://raw.githubusercontent.com/ServiceNow/BrowserGym/main/browsergym/core/src/browsergym/core/task.py)
- [BrowserGym AssistantBench task adapter](https://raw.githubusercontent.com/ServiceNow/BrowserGym/main/browsergym/assistantbench/src/browsergym/assistantbench/task.py)
- [BrowserGym API: seeding and task lifecycle](https://browsergym.readthedocs.io/latest/core/core.html)
- [OSWorld-V2 task-class packaging](https://raw.githubusercontent.com/xlang-ai/OSWorld-V2/main/evaluation_examples/task_class/README.md)
- [OpenAI BrowseComp description](https://openai.com/index/browsecomp/)
- [OpenAI trustworthy third-party evaluation playbook](https://openai.com/index/trustworthy-third-party-evaluations-foundations/)

## 一手来源的共同要求

### 1. Dataset card 应回答“这是什么、如何产生、能否负责任使用”

Hugging Face 将 dataset card 定义为数据仓库中的 `README.md`，用于解释数据内容、使用背景和潜在 bias；YAML metadata 至少应覆盖可发现性所需的名称、语言、license、task categories 等（[官方 Dataset Cards 文档](https://huggingface.co/docs/hub/datasets-cards)）。对本项目而言，科研上最小但完整的 card 应有：

| 部分 | 10-case pilot 需要记录的内容 |
| --- | --- |
| Identity | dataset name、版本、发布日期、维护者、citation |
| Intended use | 测量 browser-use agent 在固定营销资料采集任务上的能力；不等同于营销结论质量 |
| Composition | 10 个 case、Reddit/Google 两个 family、5 个复杂度等级、每题 ID/revision |
| Collection | 真实网站、固定 query/入口、验证日期、locale/timezone、是否需要登录、设计期筛选过程 |
| Schema | agent task、response、evidence、trace、eval result 的字段说明和示例 |
| Splits/status | 当前 release 中哪些题是 frozen/test，哪些仍是 candidate/validated/retired |
| Licensing/access | 代码、题目 metadata、截图/HAR、第三方网页内容各自的许可与访问限制 |
| Privacy/safety | Reddit 用户名、评论、外部 URL、账号状态和潜在个人信息的处理方式 |
| Limitations | live-web 漂移、CAPTCHA/blocked、结果个性化、地区差异、图片/视频能力边界 |
| Maintenance | revision 规则、变更日志、下线/重验证条件、联系人 |

这些是数据集说明，不应全部塞进 agent prompt。尤其 bias、license、live-web limitation 和 collection history 是 card / research 文档职责。

### 2. Task 数据、运行配置和 evaluator 要分层

WebArena-Verified 明确将 task data 与 runtime concerns 分离：公开 task 由 ID、sites、`start_urls` 和 `intent` 组成；登录、storage state 等环境配置不在导出的 agent task 中。其 `format_specification` 让结果结构可直接解析，`expected` 留在 evaluator（[data format](https://servicenow.github.io/webarena-verified/dev/getting_started/data_format/)）。官方运行器导出给 agent 的文件只包含完成任务所需的字段，运行后再生成 `agent_response.json`、`network.har` 和 `eval_result.json`（[usage](https://servicenow.github.io/webarena-verified/getting_started/usage/)）。

BrowserGym 的生命周期也将 `setup()`（返回 goal）与 `validate()`（独立计算 reward）分开；AssistantBench adapter 将 task 和 gold answer 分别装载，agent 只接收 goal，prediction 写入独立 JSONL（[BrowserGym task API](https://raw.githubusercontent.com/ServiceNow/BrowserGym/main/browsergym/core/src/browsergym/core/task.py)；[AssistantBench adapter](https://raw.githubusercontent.com/ServiceNow/BrowserGym/main/browsergym/assistantbench/src/browsergym/assistantbench/task.py)）。

OSWorld-V2 将任务实现和资产放入 gated 数据集，官方明确说明这样可以防止 agent 在执行时读取答案、setup logic 或 evaluator details（[OSWorld-V2 packaging](https://raw.githubusercontent.com/xlang-ai/OSWorld-V2/main/evaluation_examples/task_class/README.md)）。

### 3. Split 与 status 是不同概念

BrowserGym 的研究论文/生态说明将 benchmark metadata、默认 train/test split、task dependency、seed 和最大步数作为实验配置，而不是 prompt 内容（[BrowserGym ecosystem paper](https://openreview.net/attachment?id=5298fKGmv3&name=pdf)）。因此：

- **split** 描述发布/评估用途（例如 `test`、`dev`、`holdout`）。
- **status** 描述题目生命周期（例如 `candidate`、`validated`、`frozen`、`retired`）。

当前 10-case pilot 没有训练需求，不必人为拆出 train split。最小合理做法是：所有可评估题标记 `split: test`，设计期或未通过验证的题不进入该 split；若以后需要调参，再另建 `dev`，并禁止用 `test` 结果反复改题。

### 4. Live-web ground truth 必须带时间与版本，不是永久常量

BrowseComp 专门选择“短、单一、容易验证且不随时间变化”的答案，并通过人工验证和引用证据控制题目有效性；同时使用 canary string 防止 benchmark 答案被训练集或网页搜索直接泄漏（[BrowseComp 官方说明](https://openai.com/index/browsecomp/)）。这类设计不能直接套用到 Reddit/Google 动态结果。

WebArena-Verified 的解决办法是使用容器化、可重置的网站、network trace replay 和确定性 JSON evaluator；官方页面强调其可离线评估、移除 LLM-as-judge，并记录 task/data/evaluation checksums（[quick start](https://servicenow.github.io/webarena-verified/)，[removing LLM-based evaluation](https://servicenow.github.io/webarena-verified/evaluation/removing_llm_based_evaluation/)）。

对 live-web pilot，最小可复现协议应固定：

1. `case_id`、`revision` 和 benchmark release；
2. query、entry URL、结果页范围、排序、tie-break、dedup 和 shortfall 规则；
3. harness environment profile（locale、timezone、viewport、登录/个性化状态、浏览器版本）；
4. `retrieved_at`、run ID 和每次访问的 evidence snapshot；
5. 参考答案由同一 revision 和同一采集协议生成，而不是把某天的 Reddit/Google 页面当作永久 gold。

如果页面发生变化，规则未变但结果变了，应记录新的 evidence snapshot 和 shortfall，而不是静默更新旧 gold；若页面结构、查询或输出契约变化，则递增 revision 并重新验证。

### 5. Metrics 应优先确定性，不依赖 per-run LLM judge

WebArena-Verified 明确移除 LLM-as-judge，采用显式 format specification、类型感知的 normalization 和 exact/structural comparison（[官方评估说明](https://servicenow.github.io/webarena-verified/evaluation/removing_llm_based_evaluation/)）。因此当前 10-case pilot 应按输出类型使用下列指标：

| 输出类型 | 推荐 metric | 说明 |
| --- | --- | --- |
| 比例/数量/布尔值 | exact match | 例如 `official_share`、`official_count`、`eligible_result_count` |
| 固定 URL 列表 | set precision/recall/F1；需要顺序时另算 ordered exact match | URL 先按规范化规则处理，重复 URL 不重复计分 |
| 固定字段对象 | field-level exact match + object-level pass | 字段缺失、错误域名、错误 score 单独计错 |
| 短原文评论 | normalized exact match，并单独检查 permalink | 不让 LLM 判断“意思相近” |
| 浏览过程 | binary compliance checks | 是否使用固定 query、是否打开要求的页面、是否执行了规定页数/数量 |
| 访问阻塞 | status / shortfall，不伪造成功 | `blocked`、`deleted`、`partial` 应单独报告，不能用邻近结果补齐 |

聚合层只需报告 per-task success、macro average 和 shortfall rate。人工抽查可用于发现 broken task、错误 reference 或页面变化，但不应作为每次运行的主要评分器。

### 6. 科研报告必须报告 harness、预算和有效性风险

OpenAI 的一手评估 playbook指出，agent 结果不仅由模型决定，还受 harness、工具、状态、重试和预算影响；报告至少应说明 claim 类型、任务分布、被测系统、工具/harness、turn/token/time/cost budget、elicitation 方法，以及 reward hacking、contamination、refusal、broken problem 等有效性检查（[trustworthy evaluations](https://openai.com/index/trustworthy-third-party-evaluations-foundations/)）。

BrowserGym 也建议每个 benchmark 显式记录 action set、每题 seed 数、最大步数和 benchmark metadata；AssistantBench 没有任务随机化，因此不需要多个 seed（[BrowserGym ecosystem paper](https://openreview.net/attachment?id=5298fKGmv3&name=pdf)）。

当前 pilot 的运行报告最少记录：

```text
benchmark_version / case_revision
task_id / split / run_id
model_id / model_revision / reasoning_setting
harness_version / browser_version / tool access
locale / timezone / viewport / login state
max_steps / timeout / retry count / token or API budget
started_at / finished_at / status / score
shortfall or access_status
evidence_ref / trace_ref / evaluator_version
```

不用记录模型 chain-of-thought；如需审计，只保存可公开的动作轨迹、页面事件、工具错误和必要截图。

## 对当前 10-case pilot 的最小完整协议

### 推荐文件布局

```text
dataset/
  public-manifest.json          # id, revision, split, family, complexity
  agent-tasks.jsonl             # 被测 agent 唯一输入
  response-schemas/<case_id>.json
  private/
    specs/<case_id>.json        # collection + evaluator + validation
    reference/<release>/<id>.json
  dataset-card.md               # 科研/使用说明
runs/<release>/<run_id>/<case_id>/
  task.json                     # 本次运行的 agent task 冻结副本
  agent_response.json           # compact response
  evidence.json                 # raw source fields + retrieved_at
  trace.jsonl                   # action/event trace
  screenshots/                  # only if requested
  eval_result.json              # deterministic score + status
```

其中 `questions.md` 是 `agent-tasks.jsonl` 的人类阅读视图，不是 runner 的事实来源；`cases/*.json` 应逐步成为 private spec，或至少明确哪些字段不导出。

### Agent-visible 最小 task object

每题公开 payload 只需：

```json
{
  "task_id": "rd-001",
  "revision": 4,
  "split": "test",
  "site": "reddit",
  "start_urls": ["<fixed entry URL>"],
  "prompt": "<自洽的固定查询、机械选择和最终返回要求>",
  "response_schema": "response-schemas/rd-001.json"
}
```

`prompt` 必须包含所有会改变执行结果的规则：固定网站概念、query、数量、排序、同分处理、是否打开详情、是否读取图片、fallback 禁止条件和最终答案形状。它不能要求 agent 回查公共 Markdown 或 private case。

### Private spec 最小字段

private spec 保存：

```text
case_id / revision / agent_task_ref
collection_spec: eligibility, ordering, tie_breakers, dedup, shortfall, evidence schema
evaluation_spec: response schema, deterministic comparison, reference snapshot ref
validation: real-browser checks, checked_at, access observations
research_context: marketing rationale, candidate history, rejected alternatives
```

`marketing_context` 可以保留营销价值，但不应进入 agent prompt，也不应成为语义筛选依据。

## `rd-001` 的规范化判断

按上述协议，`rd-001` 当前应视为一份**维护者 case spec**，不是可直接发布的 agent task：

- 可以公开导出的：Reddit entry URL、`r/Jackery`、精确查询、Past Year / Top、帖子与一级评论数量、图片触发条件、compact response schema。
- 应从 prompt 移出的：`marketing_context.intended_use`、`selection_rules.marketing_rationale`、设计阶段“约 14 个结果”的观察、验证 notes 和 reference URL 集合。
- 必须隐藏的：设计期答案样本、未来 reference answer、evaluator 比较逻辑、截图/HAR、selected post/comment IDs、账号/storage state。
- 题面中的 `visible top-score order` 应改为网站可识别的表达：“将 Reddit 搜索结果排序设为 Top；按帖子旁显示的 score 从高到低选择”。不要把自造的 `top-score order` 当成网站操作名。
- `execution_task.objective` 与 `answer_contract` 必须只保留一个最终答案契约：完整采集进入 `evidence.json`，最终 response 只返回规定数量的评论/图片对象。

## 不应堆砌的字段与不应采用的做法

- 不要为每个营销概念建立一个 prompt 字段；只保留会改变执行或评分的字段。
- 不要把 `design_validation`、候选研究过程和营销 rationale 复制进 agent task。
- 不要用一个大而含糊的“LLM judge”评价长原文；先把问题改写为数量、比例、URL、布尔值或固定字段。
- 不要把 live-web 的一次结果当作永久 exact-match gold；使用 revision + timestamp + evidence snapshot。
- 不要为了形式强行设立 train split；10-case pilot 只需 `test`，待有独立调参题后再增加 `dev`。
- 不要只报告总成功率；至少按 case、family、complexity 和 access status 报告，并附 harness / budget。

## 发布前最小验收清单

1. 每个 `test` task 有唯一 revision、固定入口和自洽 prompt。
2. `response_schema` 能由确定性 evaluator 解析；没有隐含的“相关”“高质量”“主要痛点”等语义判断。
3. reference/evaluator/validation 与 agent-visible payload 分离，且 agent 可访问目录不存在答案文件。
4. 每个 live-web case 有 `retrieved_at`、浏览器环境、证据快照和 shortfall 记录。
5. 至少一次独立人工复核确认 query、字段、数量和答案契约可执行；复核失败的题不进入 `test`。
6. 运行报告固定模型、harness、工具、预算、重试和时间；比较不同 agent 时这些条件保持一致。
7. dataset card 写清用途、组成、collection、license/access、隐私、限制、split/status、版本和引用。
