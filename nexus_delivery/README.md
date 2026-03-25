# Nexus Delivery OS

This directory is the project management and delivery operating system for
Nexus.core.

## Structure

- `00_governance`: charter, ways of working, quality gates.
- `01_product`: vision, roadmap, release plan.
- `02_backlog`: epics, features, stories, tasks, dependencies, refinement logs.
- `03_sprints`: sprint-scoped plans, logs, retrospectives, and velocity
  snapshots.
- `04_decisions`: architecture and product decisions (ADR style).
- `05_sessions`: templates and operational session logs.
- `06_metrics`: delivery and quality metrics.
- `07_releases`: release readiness and ASDLC bundle artifacts.
- `08_risks`: risk register and mitigations.
- `09_templates`: reusable templates.
- `10_guidance`: onboarding and directory-purpose guidance.

## Operating Rules

1. Every story must map to an Epic and Feature ID.
2. Every task must map to one Story ID.
3. Every test artifact must map to one Story or Feature ID.
4. Every implementation PR must link Story ID(s) and session evidence.
5. Every architectural change must create or update one ADR.
6. Every sprint must include `plan.md`, `log.md`, `retrospective.md`, and
   `velocity_snapshot.json`.
7. Every release must include an ASDLC transaction bundle.

## Hybrid Governance Gates

- Blocking gates: failing tests, critical/high security findings, missing Story
  linkage, missing required sprint evidence for committed work.
- Advisory gates: missing refinement notes, delayed retrospective action
  follow-up, incomplete optional metrics.
