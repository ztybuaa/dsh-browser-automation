# Browser-agent benchmark format research (2026-09-03)

## Scope and sources

This note reviews first-party benchmark repositories and specifications for browser/computer-use agents. The goal is to refine this repository's task wording and artifact layout, not to copy another benchmark's evaluator implementation.

Primary sources reviewed:

- [WebArena example task `2.json`](https://raw.githubusercontent.com/web-arena-x/webarena/main/config_files/examples/2.json)
- [WebArena-Verified data format](https://servicenow.github.io/webarena-verified/dev/getting_started/data_format/)
- [WebArena-Verified task model](https://raw.githubusercontent.com/ServiceNow/webarena-verified/main/src/webarena_verified/types/task.py)
- [WebArena-Verified usage and output files](https://servicenow.github.io/webarena-verified/getting_started/usage/)
- [BrowserGym `AbstractBrowserTask`](https://raw.githubusercontent.com/ServiceNow/BrowserGym/main/browsergym/core/src/browsergym/core/task.py)
- [BrowserGym AssistantBench task adapter](https://raw.githubusercontent.com/ServiceNow/BrowserGym/main/browsergym/assistantbench/src/browsergym/assistantbench/task.py)
- [OSWorld-V2 task-class format](https://github.com/xlang-ai/OSWorld-V2/blob/main/evaluation_examples/task_class/README.md)
- [OpenAI `simple-evals` repository](https://github.com/openai/simple-evals)

## Observed conventions

### 1. The agent-facing task is short and imperative

WebArena stores a compact `intent` beside the start URL and evaluator configuration. Its example is simply `Check out the classification section`; navigation and correctness are specified separately in `eval` and `reference_action_sequence` ([task JSON](https://raw.githubusercontent.com/web-arena-x/webarena/main/config_files/examples/2.json)).

WebArena-Verified keeps the same separation: `intent` is the natural-language goal, while `start_urls`, typed evaluators, and `format_specification` carry execution and checking details ([task model](https://raw.githubusercontent.com/ServiceNow/webarena-verified/main/src/webarena_verified/types/task.py)).

**Implication:** the benchmark question shown to an agent should contain only the user goal and the exact requested output format. Marketing rationale, candidate-selection history, validation notes, and evaluator internals belong in the case metadata, not in the question.

### 2. Output format is explicit and machine-checkable

WebArena-Verified added `format_specification` because free-form answers caused ambiguity. Its example asks for an array of objects with named fields and the evaluator declares a JSON schema plus whether order matters. The documentation also recommends rewriting open-ended prompts into directly checkable requests, for example asking for review titles with a fixed rating threshold instead of asking for “main criticisms” ([format specification](https://servicenow.github.io/webarena-verified/dev/getting_started/data_format/), [removing LLM evaluation](https://servicenow.github.io/webarena-verified/evaluation/removing_llm_based_evaluation/)).

AssistantBench uses the same basic pattern at a simpler level: each dataset row has an `id`, a short `task`, and a scalar `answer`; the BrowserGym adapter compares the final assistant message with the stored answer and writes predictions to JSONL ([adapter](https://raw.githubusercontent.com/ServiceNow/BrowserGym/main/browsergym/assistantbench/src/browsergym/assistantbench/task.py)).

**Implication:** prefer compact outputs such as a ratio, count, boolean, one quoted comment, or a short list of URLs. Keep long raw page text in evidence artifacts rather than in the final answer field. Every list should specify exact count, field names, and ordering (or explicitly state unordered).

### 3. Task data, runtime setup, and evaluation are separate

WebArena-Verified separates task data from runtime concerns. `start_urls`, `intent`, evaluator configs, expected values, and a revision number are task data; login state, credentials, and environment configuration are handled outside the task export ([field mapping](https://servicenow.github.io/webarena-verified/dev/getting_started/data_format/)).

BrowserGym's `AbstractBrowserTask` gives each task a stable task ID, a `setup` method that returns the goal and task-specific info, and a separate `validate` method that returns reward/done state ([source](https://raw.githubusercontent.com/ServiceNow/BrowserGym/main/browsergym/core/src/browsergym/core/task.py)).

**Implication:** keep this repository's case JSON as the single source for frozen task intent, fixed entry URLs/query strings, selection rules, output schema, and reference evidence. Do not put credentials or mutable browser state in the case question. Keep design-time validation and runtime execution metadata in separate fields/files.

### 4. Run artifacts are per-task and reproducible

WebArena-Verified writes one directory per task containing `agent_response.json` and `network.har`, then adds `eval_result.json` and a batch log during evaluation ([usage](https://servicenow.github.io/webarena-verified/getting_started/usage/)). The response has explicit operation type, status, retrieved data, and optional error details.

OSWorld-V2 similarly treats a task as a versioned bundle: a task class/config contains an ID, snapshot, instruction, setup, related apps, and evaluator; the task runner writes per-task trajectories and result files. Its README deliberately keeps task implementations and assets separately distributed to reduce benchmark leakage ([task-class format](https://github.com/xlang-ai/OSWorld-V2/blob/main/evaluation_examples/task_class/README.md)).

**Implication:** use a stable directory layout such as `runs/<case_id>/<run_id>/` with:

```text
agent_response.json   # compact, evaluator-facing answer
evidence.json         # selected raw fields and source URLs
trace.jsonl           # browser actions/events, if available
screenshots/          # only when the case requests visual evidence
eval_result.json      # score, status, and shortfall/error details
```

For live-web cases, include `retrieved_at`, source URLs, and the benchmark revision in `evidence.json`; this makes answer drift observable without expanding the agent's final response.

### 5. Revision and leakage controls are first-class

WebArena-Verified includes an integer `revision` and typed evaluator definitions. OSWorld-V2 keeps task classes/assets gated in part to prevent agents from reading setup logic or answers. OpenAI's `simple-evals` follows a lightweight per-example evaluation loop and stores only the sampled conversation/result in reports ([repository](https://github.com/openai/simple-evals)).

**Implication:** increment a case revision whenever the wording, query set, selection rule, or output schema changes. Keep reference answers and validation snapshots outside the agent-facing task payload. A checkpoint should identify the exact case revision and retrieval date.

## Recommendations for this repository

1. **Make `question` concise.** Use one imperative sentence per case or subquestion. Put fixed query strings, counts, and field names in the sentence only when the agent needs them to execute the task.
2. **Make the final answer small.** Define a single scalar or a short fixed-shape list wherever possible (`official_share`, a count, one comment plus URL, or up to N URLs). Store the full collected material under evidence, not in the answer.
3. **Use standard website terms.** Prefer terms visible on the source site, such as “Reddit post score,” “comment score,” “Google Web result,” “visible domain,” “title,” “H1,” “canonical URL,” and “meta description.” Define any unavoidable benchmark-specific field once in the schema; do not invent user-facing action names.
4. **Separate execution from post-processing.** The question should specify deterministic collection and a final mechanical operation (filter, count, ratio, de-duplicate, or select by displayed score). It should not ask the agent to summarize, infer intent, or produce a marketing recommendation during benchmark scoring.
5. **Keep metadata out of the prompt.** Marketing context, design rationale, real-browser validation records, CAPTCHA/access observations, and checkpoint history remain in case JSON/research notes.
6. **Version and store runs explicitly.** Preserve `case_id`, `revision`, `retrieved_at`, query/URL provenance, compact response, raw evidence, and evaluator result per run. This supports live-web drift without making the answer format verbose.

## Boundary for the current Jackery cases

The current cases already have useful frozen selection rules and real-browser validation. The next wording pass should primarily remove explanatory prose from `dataset/questions.md`, expose only the deterministic operation and compact output contract, and leave the richer marketing rationale in `marketing_context` and the research notes. No case should be admitted solely because it sounds plausible; its entry URL, query, visible fields, and output contract must remain validated in a real browser.

