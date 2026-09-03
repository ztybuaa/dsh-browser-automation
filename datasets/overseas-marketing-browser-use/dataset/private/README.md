# Private benchmark material

This directory is available to the harness and benchmark maintainers only. It must not be mounted, indexed, or exposed to the tested agent.

- `protocols.json`: shared platform-selection definitions.
- `evaluators/*.json`: task-specific collection and deterministic scoring rules.
- `design-validation/`: exploratory live-browser samples used to admit or reject tasks; these are not permanent gold answers.

Formal runs add reference answers under a revision- and reference-window-specific directory. Design-validation samples must never be reused as permanent live-web ground truth.
