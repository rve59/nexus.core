# Decision Log

Use ADR files to record architectural and process decisions.

## Naming

- `ADR-<number>-<short-title>.md`

## Rules

1. New architecture decision requires a new ADR.
2. Superseded decisions remain immutable and reference replacement ADR.
3. Each ADR must link affected Epics/Features/Stories.
4. Agent-generated decisions that influence implementation scope must be
   recorded in `agent-decision-log/`.

## Agent Decision Log Naming

- `AGDEC-SPR<nn>-YYYY-MM-DD-<agent>.md`
