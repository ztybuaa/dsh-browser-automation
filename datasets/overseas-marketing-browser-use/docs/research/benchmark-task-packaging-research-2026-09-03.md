# Browser / computer-use benchmark 题目封装复核（2026-09-03）

## 结论

当前 `dataset/questions.md` 适合人工审阅，但执行时只向被测 agent 提供其中一道题；设计期总档案和隐藏评分信息保存在 `dataset/private/`，也不应整份交给 agent。

建议采用三层封装：

1. **Agent input（公开执行包）**：每题只包含 ID、版本、网站、起始 URL、自洽的简洁 prompt 和严格的响应 schema。
2. **Private specification（隐藏规格）**：保存完整选择算法、缺失数据规则、evaluator、reference answer、验证记录和证据要求。
3. **Run artifacts（逐次运行产物）**：保存 agent response、原始 evidence、轨迹和评分结果。

应新增一个可机器读取的 `agent-tasks.jsonl`（或等价 JSON 数组）作为被测 agent 的唯一题目入口。`questions.md` 应由该文件生成，继续承担人工阅读职责。单题 prompt 文件可以由 manifest 按需导出，但不应成为第二套手工维护的事实来源。

## 一手来源所展示的分层方式

### WebArena 与 WebArena-Verified

WebArena 的原始任务 JSON 把 `intent`、`start_url`、`eval.reference_answers`、`reference_url` 和参考操作序列放在同一个任务配置中；其中真正面向 agent 的自然语言仍只是简短 `intent`。例如官方示例的 `intent` 是 `Check out the classification section`，正确 URL 和参考动作位于其他字段中（[WebArena 官方示例任务](https://raw.githubusercontent.com/web-arena-x/webarena/main/config_files/examples/2.json)）。

WebArena-Verified 进一步明确区分任务数据和 runtime concerns，并为任务加入 typed evaluators、`format_specification` 和 `revision`。其官方说明将登录要求、storage state 等移出任务数据，将 reference answer 放入 evaluator 的 `expected`（[WebArena-Verified data format](https://servicenow.github.io/webarena-verified/dev/getting_started/data_format/)；[官方 task model](https://raw.githubusercontent.com/ServiceNow/webarena-verified/main/src/webarena_verified/types/task.py)）。

更重要的是，WebArena-Verified 并不把完整任务对象直接交给 agent。官方 `agent-input-get` 导出的 agent 输入只有 `task_id`、`intent_template_id`、`sites`、`start_urls` 和 `intent`。运行结束后，每题单独保存 `agent_response.json` 和 `network.har`，评分再产生 `eval_result.json`（[官方 usage](https://servicenow.github.io/webarena-verified/getting_started/usage/)）。

这直接支持本项目采用“完整私有 spec -> 导出最小 agent task”的方式，而不是让 agent 读取 `cases/*.json`。

### BrowserGym 与 AssistantBench

BrowserGym 的任务接口把 `setup()` 与 `validate()` 分开：`setup()` 返回给 agent 的是 `goal` 和必要的 task info，而 `validate()` 独立接收页面状态和消息并返回 reward（[BrowserGym `AbstractBrowserTask`](https://raw.githubusercontent.com/ServiceNow/BrowserGym/main/browsergym/core/src/browsergym/core/task.py)）。

BrowserGym 的 AssistantBench adapter 从数据集分别提取 `task` 与 `answer`。初始化时同时持有 goal 和 gold answer，但 `setup()` 只返回 goal；最终 prediction 单独写入 JSONL，再由 scorer 对照隐藏 gold answer（[BrowserGym AssistantBench adapter](https://raw.githubusercontent.com/ServiceNow/BrowserGym/main/browsergym/assistantbench/src/browsergym/assistantbench/task.py)）。

这说明“维护代码能够访问答案”不等于“答案应出现在 agent payload 中”。本项目也应让 harness 持有 hidden spec / reference answer，只把 prompt 和必要运行输入交给插件。

### OSWorld-V2

OSWorld-V2 的最小任务类同时定义 `instruction`、环境 snapshot、setup 和 evaluator，但官方任务实现及完整资产通过 gated 数据集分发。官方说明明确指出，这样做是为了避免被测 agent 在线找到答案、setup logic 或 evaluator details。任务 release manifest 还会固定任务仓库 tag 和资产快照（[OSWorld-V2 官方 task-class 文档](https://raw.githubusercontent.com/xlang-ai/OSWorld-V2/main/evaluation_examples/task_class/README.md)）。

这支持本项目把真实浏览器验证记录、reference answer、评分规则和原始快照排除在公开 agent 输入之外，并用 revision / checkpoint 固定私有规格。

## 对当前文件的审阅

### `dataset/questions.md`

优点：已经把题目按平台集中展示，且大多数任务给出了固定查询、数量和紧凑最终输出。

问题：

- 文件开头写明“每题的筛选规则以对应 JSON 为准”，因此单独取出一道题仍可能缺少执行规则；这不符合“agent 只读一道题即可执行”的目标。
- Reddit 的 score 定义、同分规则和缺失数据规则位于公共前言，而不是每道任务 payload 内。Markdown 中可读，但被 runner 单题抽取后会丢失。
- 文件混有版本说明、设计状态和“真实网站已验证”等维护信息，这些不会帮助 agent 完成任务。
- 它是人工文档，难以保证 runner、schema 和题面始终同步。

建议：`questions.md` 只作为从公开 manifest 生成的阅读视图。被测 agent 不读取该 Markdown，而读取单个导出的 task object。

### `dataset/private/design-validation/rd-001.json`

`rd-001.json` 当前至少混合了三类职责：

- **Agent 必须知道**：`operation_scope.entry_url`、固定查询、目标社区、排序/数量、直接回复的定义、图片触发条件、最终输出格式、阻塞时不得替换结果。
- **维护者需要但 agent 不需要**：`marketing_context`、`fixed_research_object`、`selection_rules.marketing_rationale`、设计版本状态。
- **必须对被测 agent 隐藏**：`design_validation`、验证时看到的结果数量、reference URLs / notes、未来的 reference answer、evaluator 比较方式及评分容差。

此外存在两个具体封装问题：

1. `execution_task.objective` 要求“return the first 10 eligible post records plus ... replies”，但 `answer_contract` 要求最终只返回 5 条评论和最多 3 条图片证据。虽然 evidence / response 可以分开保存，但这两个句子对 agent 来说像是两个不同的最终输出要求。
2. `selection_rules.primary` 使用 `visible top-score order`，这不是 Reddit 页面上的标准标签。题面应使用网站上可识别的操作和属性，例如“将搜索结果排序设为 Top”以及“帖子旁显示的 score”，避免将两个概念合成自造术语。

## 推荐的最小公开任务结构

推荐公开执行包采用下面的最小结构：

```json
{
  "task_id": "rd-001",
  "revision": 4,
  "site": "reddit",
  "start_urls": [
    "https://www.reddit.com/r/Jackery/search/?q=%22Explorer%205000%20Plus%22&restrict_sr=1&sort=top&t=year"
  ],
  "prompt": "<简洁且自洽的完整题目>",
  "response_schema": {
    "type": "object",
    "required": ["comments", "images"],
    "properties": {
      "comments": {
        "type": "array",
        "maxItems": 5,
        "items": {
          "type": "object",
          "required": ["text", "comment_url", "post_url", "score"]
        }
      },
      "images": {
        "type": "array",
        "maxItems": 3,
        "items": {
          "type": "object",
          "required": ["image_url", "visible_facts"]
        }
      }
    }
  }
}
```

这里只建议六个顶层字段：

- `task_id`：稳定标识。
- `revision`：题目、选择规则或响应 schema 改动时递增。
- `site`：runner 选择环境所需的平台标识。
- `start_urls`：固定入口；与 prompt 一同构成 task instance 输入。
- `prompt`：agent 可见、简洁且自洽的任务。
- `response_schema`：agent 可见的严格输出形状；明确字段、最大数量和顺序要求。

若 locale、timezone 或登录状态会改变网页内容，由 harness 的 environment profile 固定，并通过独立运行配置传入；只有 agent 必须主动操作的前提才应写进 prompt。

### `rd-001` 的公开 prompt 应包含什么

不建议在研究文档中替代正式题面，但其结构应稳定为三部分，并保持在一个短任务内：

1. **在哪里、搜什么**：固定 `r/Jackery`、精确短语、Top / Past Year。
2. **如何机械选择**：帖子数、每帖直接回复数、按页面显示 score 的排序及并列规则、不得 fallback、何时读取图片。
3. **返回什么**：只返回最终 5 条评论和最多 3 条图片；完整帖子、评论和图片记录由 harness 写入 evidence，而不是要求 agent 在最终响应中重复返回。

如果插件本身不能把采集过程写入独立 evidence channel，就不能一边要求“完整 evidence”一边让最终响应只返回 5 条评论。此时应由 harness 从浏览器 trace / structured tool results 构造 evidence，或明确将 evidence 也作为单独工具输出；不能用互相冲突的 prompt 弥补接口缺口。

## 推荐的隐藏规格结构

现有 `cases/*.json` 可以重构为 private spec，最小职责如下：

```json
{
  "task_id": "rd-001",
  "revision": 4,
  "agent_task_ref": "agent-tasks.jsonl#rd-001",
  "collection_spec": {
    "eligibility": {},
    "ordering": {},
    "tie_breakers": [],
    "deduplication": {},
    "missing_data": {},
    "evidence_schema_ref": "evidence-schema.json"
  },
  "evaluation_spec": {
    "response_schema_ref": "response-schemas/rd-001.json",
    "comparison": {},
    "reference_answer_ref": "private/reference-answers/<snapshot>/rd-001.json"
  },
  "validation": {
    "method": "real_browser",
    "checked_at": "...",
    "evidence_refs": []
  },
  "research_context": {}
}
```

营销背景仍有价值，但应位于 `research_context`，只用于案例设计和展示 benchmark 的营销价值，不参与 agent prompt，也不参与语义筛选。

## Manifest 与单题 prompt 文件

### 应有公开 manifest

建议新增：

```text
dataset/
  agent-tasks.jsonl          # agent-facing，可执行题目，每行一个 task
  public-manifest.json       # ID、revision、site、family、complexity、split
  private/
    specs/<task_id>.json     # 完整隐藏执行/评分规格
    reference-answers/...    # 时间戳或 snapshot 对应的答案
  schemas/
    agent-task.schema.json
    evidence.schema.json
    responses/<task_id>.json
```

`public-manifest.json` 方便列出 benchmark 范围，但不需要重复完整 prompt；`agent-tasks.jsonl` 是 runner 的输入。对于只有 10 道题的数据集，JSONL 比 10 份手写 prompt 文件更易校验和批量执行。

### 单题 prompt 文件应是派生产物

为支持“每次只把一道题交给 agent”，runner 可以从 `agent-tasks.jsonl` 导出：

```text
runs/<run_id>/<task_id>/task.json
```

它是本次运行的冻结副本，不应人工编辑。这样既有单题隔离，又不会出现 `questions.md`、case JSON 和 prompt 文件三处手工同步。

## 绝不能给被测 agent 的字段

以下内容不得进入 prompt、agent-visible manifest、浏览器可读本地目录或其他可检索上下文：

- reference / gold answer，包括设计期试跑答案和预期 URL 列表；
- evaluator 配置、比较函数、字段权重、评分阈值、容差和部分分规则；
- `design_validation.checks` 中观察到的结果数量、命中页面和已知答案线索；
- 真实浏览器验证截图、HAR、页面快照及其中的答案内容；
- 参考操作序列、理想轨迹、选择后的帖子或评论 ID；
- setup logic、账号凭据、storage state、cookies 和 secrets；
- failure fixtures、隐藏 shortfall 预期和用于判定 CAPTCHA / blocked 的内部规则；
- 能反推出 gold answer 的文件路径、文件名或 source URL。

可以公开但不应塞进 prompt 的字段包括营销背景、复杂度标签、case family、设计 rationale 和研究记录。这些不会直接泄漏答案，但会增加题面噪声，或诱导 agent 按语义偏好选择素材。

## 可复现性与 live-web 答案

live-web benchmark 不应把“可复现”误解为答案永远不变。应固定：

- task revision；
- query / start URL；
- harness environment profile（locale、timezone、viewport、登录状态和个性化设置）；
- collection / ordering / tie / shortfall 规则；
- 执行时间和 run ID；
- 本次执行的 evidence 与 reference answer snapshot。

评分时，agent response 应与同一采集窗口生成的 reference answer 对照，或由确定性的 evidence evaluator 检查。不能用数日前的动态 Reddit / Google 结果作为永久 exact-match gold answer。

## 对本仓库的具体重构顺序

1. 先将当前版本保存为 checkpoint。
2. 从 `cases/*.json` 生成 `agent-tasks.jsonl`，只导出最小 agent-visible 字段。
3. 将每题所有会改变执行结果的规则写入该题的 `prompt` 或 `response_schema`，不再要求 agent 回查 `questions.md` 的公共前言或 private case。
4. 把 `questions.md` 改为从 `agent-tasks.jsonl` 生成的人类阅读视图。
5. 把完整 case 拆成 private `collection_spec`、`evaluation_spec`、`validation` 与 `research_context`。
6. 将 `answers/` 中的设计期试跑结果明确放到 private / design-validation 区域，绝不由 agent runner 挂载。
7. validator 同时检查：公开 task 自洽、公开/私有 revision 一致、公开文件不存在 banned hidden fields、response schema 与 evaluator expected shape 一致。

这个结构保留了当前案例设计中有价值的严格规则，同时使被测 agent 看到的内容更接近成熟 benchmark：一个简洁目标、固定环境入口、明确输出格式，而不是整份研究档案。
