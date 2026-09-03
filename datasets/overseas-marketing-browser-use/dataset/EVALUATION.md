# Evaluation Protocol

## Unit of evaluation

One case file is one independently executed and scored task. A run records the task revision, environment profile, start time, final JSON response, browser trace, evidence, and evaluator result.

## Controlled environment

All compared agents use the same browser image, viewport, locale, region, account state, extension set, and network policy. Google tasks use US English Web Search with personalization disabled. Reddit tasks use the same controlled account state for every agent. Credentials and storage state are runtime secrets and never enter task files.

## Live-web reference

Each evaluation batch has a `reference_window_id`. A reference collector runs every task in the same environment during that window and stores the selected records and expected response privately. If the reference collector cannot reach the task's start surface, the task is marked `environment_invalid` and excluded from that batch's success denominator. If the reference succeeds but an evaluated agent fails to reach or process the same task, the agent fails that task.

Reference answers are attached to the task revision and window; an older Reddit or Google result is never treated as permanent ground truth.

## Deterministic checks

No LLM judge is used. Evaluators check:

1. `schema_valid`: the final response matches the task's JSON Schema.
2. `selection_accuracy`: returned records follow the fixed query, result order, count, filtering, and deduplication rules.
3. `content_fidelity`: quoted text and visible values match the source evidence after whitespace normalization only.
4. `provenance_valid`: every returned URL resolves to the selected source record.
5. `coverage`: required records returned divided by records available under the task rule, capped at the requested count.

`success@1` is 1 only when the response is schema-valid and every applicable selected record, value, ordering rule, and provenance check passes. Otherwise it is 0. Report mean `success@1` across all valid tasks as the primary score, with the five component metrics reported separately.

## Reporting

Report task-level results, macro averages by site, and macro averages by complexity level. Also report environment-invalid counts, access failures, token/API usage, and wall-clock time, but do not fold infrastructure failures into model accuracy.

Do not compare agents from different task revisions or reference windows in the same aggregate score.
