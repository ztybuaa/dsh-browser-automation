# Overseas Marketing Browser Use Benchmark

## Scope

This pilot dataset evaluates whether a browser agent can collect and mechanically process live Reddit and Google Search material for overseas marketing research. It does not score marketing analysis, copywriting, or open-ended recommendations.

The dataset contains ten independently scored tasks: five Reddit tasks and five Google Search tasks, ordered from L1 to L5 by browser-operation complexity. Every task was selected after a real-browser feasibility check. Because the websites are live, the current release is a pilot rather than a frozen public leaderboard set.

## Files

- `questions.md`: the only source of benchmark question text and the primary human-readable task set.
- `index.json`: task IDs, sites, complexity levels, and answer-example paths.
- `answer-examples/*.json`: response-shape examples only; they contain no questions or reference answers.
- `schemas/responses.schema.json`: response schema for every task.
- `schemas/evidence.schema.json`: stored run-evidence schema.
- `EVALUATION.md`: evaluation and reporting protocol.
- `private/`: evaluator rules and design-validation material; never expose this directory to the tested agent.

## Task interface

Give the tested agent exactly one **题目** paragraph from `questions.md` and, when needed, its linked file under `answer-examples/`. Do not give it `private/`, `docs/research/`, `checkpoints/`, or previous runs.

The linked JSON is a format example, not a filled answer. The task response must conform to the corresponding definition in `schemas/responses.schema.json`. Browser traces and complete raw evidence are captured by the harness, not repeated in the prompt.

## Dataset status

Version `0.4.1` is a ten-task pilot split. This revision only clarifies localized UI labels; query, selection, and response semantics are unchanged. It is suitable for task and harness development. Formal model comparison additionally requires same-window reference collection and the reporting rules in `EVALUATION.md`.
