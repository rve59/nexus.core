# Nexus.core Directory Guidance

This document is the consolidated onboarding guide for core tracked directories
in Nexus.core. It explains what each directory is for, what files usually live
there, and how new team members should work with each area.

## Table of Contents

1. [How to Use This Guide](#how-to-use-this-guide)
2. [00_ops](#00-ops)
3. [00_ops/scripts](#00-ops-scripts)
4. [00_ops/scripts/health](#00-ops-scripts-health)
5. [00_ops/scripts/runtime](#00-ops-scripts-runtime)
6. [blueprint](#blueprint)
7. [.github](#github)
8. [.github/workflows](#github-workflows)
9. [nexus_delivery](#nexus-delivery)
10. [nexus_delivery/00_governance](#nexus-delivery-00-governance)
11. [nexus_delivery/01_product](#nexus-delivery-01-product)
12. [nexus_delivery/02_backlog](#nexus-delivery-02-backlog)
13. [nexus_delivery/02_backlog/refinement-log](#nexus-delivery-02-backlog-refinement-log)
14. [nexus_delivery/03_sprints](#nexus-delivery-03-sprints)
15. [nexus_delivery/03_sprints/SPR-00-bootstrap](#nexus-delivery-03-sprints-spr-00-bootstrap)
16. [nexus_delivery/03_sprints/SPR-01-intent-core](#nexus-delivery-03-sprints-spr-01-intent-core)
17. [nexus_delivery/03_sprints/templates](#nexus-delivery-03-sprints-templates)
18. [nexus_delivery/04_decisions](#nexus-delivery-04-decisions)
19. [nexus_delivery/04_decisions/agent-decision-log](#nexus-delivery-04-decisions-agent-decision-log)
20. [nexus_delivery/05_sessions](#nexus-delivery-05-sessions)
21. [nexus_delivery/05_sessions/logs](#nexus-delivery-05-sessions-logs)
22. [nexus_delivery/06_metrics](#nexus-delivery-06-metrics)
23. [nexus_delivery/06_metrics/dashboards](#nexus-delivery-06-metrics-dashboards)
24. [nexus_delivery/07_releases](#nexus-delivery-07-releases)
25. [nexus_delivery/08_risks](#nexus-delivery-08-risks)
26. [nexus_delivery/09_templates](#nexus-delivery-09-templates)
27. [nexus_delivery/10_guidance](#nexus-delivery-10-guidance)
28. [nexus_web](#nexus-web)
29. [nexus_web/public](#nexus-web-public)
30. [nexus_web/src](#nexus-web-src)
31. [nexus_web/src/assets](#nexus-web-src-assets)
32. [src](#src)
33. [src/api](#src-api)
34. [src/templates](#src-templates)
35. [src/ui](#src-ui)
36. [tests](#tests)
37. [Quick Placement Heuristics](#quick-placement-heuristics)

<a id="how-to-use-this-guide"></a>

## How to Use This Guide

1. Start at the highest-level directories first (`nexus_delivery`, `src`,
   `nexus_web`, `tests`).
2. Use nested directory sections to understand where to place new artifacts.
3. Follow the examples to avoid scattering files into the wrong domain.
4. Keep this file updated when directory responsibilities change.

<a id="00-ops"></a>

## 00_ops

Purpose: Operational tooling for local/runtime operations. This is where
command-line helpers live for starting, restarting, and health-checking
services.

Typical files and subdirectories:

- `scripts/`

Examples:

- If an engineer needs to restart backend and management services in a
  repeatable way, the script belongs under this tree.
- If an incident runbook references a command, that command script should live
  here (not in root).

Onboarding note: Treat this as the operational entry point before changing
production-like local execution behavior.

<a id="00-ops-scripts"></a>

## 00_ops/scripts

Purpose: Namespace for executable operational scripts and script documentation.

Typical files and subdirectories:

- `README.md`
- `health/`
- `runtime/`

Examples:

- `README.md` describes script intent and expected usage patterns.
- Subfolders separate concerns: health checks vs runtime process control.

Onboarding note: When adding a script, place it in the correct concern folder
first, then update `README.md` with usage and assumptions.

<a id="00-ops-scripts-health"></a>

## 00_ops/scripts/health

Purpose: Health validation and heartbeat checks for service readiness and
liveness.

Typical files and subdirectories:

- `heartbeat.py`

Examples:

- `heartbeat.py` can send a lightweight API interaction to confirm the system is
  responsive after startup.

Onboarding note: Health scripts should be idempotent and safe to run repeatedly
in CI or manual ops workflows.

<a id="00-ops-scripts-runtime"></a>

## 00_ops/scripts/runtime

Purpose: Runtime lifecycle controls (start/restart process wrappers).

Typical files and subdirectories:

- `restart_mgt.sh`
- `restart_nexus.sh`

Examples:

- `restart_nexus.sh` is used after config changes to reset frontend/backend
  runtime state consistently.

Onboarding note: Keep scripts path-stable and log-path aware so teammates can
run them from any shell location.

<a id="blueprint"></a>

## blueprint

Purpose: Intent/discovery artifacts that capture upstream product and
architecture design before implementation enters delivery workflows.

Typical files and subdirectories:

- stream IDs such as `7b4e418c-...` and `7c50d6d8-...`
- `sessions/`

Examples:

- A discovery stream can contain architecture and intent documents used to
  justify feature decomposition later in backlog artifacts.

Onboarding note: Think of `blueprint` as pre-delivery design memory: capture
rationale and structure before execution tasks are created.

<a id="github"></a>

## .github

Purpose: Repository automation and policy enforcement configuration.

Typical files and subdirectories:

- `workflows/`

Examples:

- CI pipelines and governance checks run from here on pull requests and branch
  updates.

Onboarding note: Changes here affect collaboration flow for everyone; treat
workflow edits like platform changes with review discipline.

<a id="github-workflows"></a>

## .github/workflows

Purpose: CI/CD workflow definitions that enforce quality and delivery
governance.

Typical files and subdirectories:

- `dod-gates.yaml`
- `drift-detection.yaml`
- `release-bundle.yaml`
- `test-matrix.yaml`

Examples:

- `test-matrix.yaml` runs tests across targeted dimensions.
- `release-bundle.yaml` validates release artifact structure before publish.

Onboarding note: If you add a new quality gate, document whether it is blocking
or advisory and align with governance docs.

<a id="nexus-delivery"></a>

## nexus_delivery

Purpose: Project management operating system for agentic Scrum execution. This
is the single governance source for planning, execution evidence, and release
readiness.

Typical files and subdirectories:

- `README.md`
- `00_governance/` through `10_guidance/`

Examples:

- Product strategy, backlog hierarchy, sprint logs, ADRs, metrics, and release
  checklists all live here with explicit traceability.

Onboarding note: When uncertain where a delivery artifact belongs, start by
checking this tree before creating new top-level documentation elsewhere.

<a id="nexus-delivery-00-governance"></a>

## nexus_delivery/00_governance

Purpose: Defines delivery rules, role boundaries, quality thresholds, and
governance mechanics.

Typical files and subdirectories:

- `project_charter.md`
- `definition_of_ready.md`
- `definition_of_done.md`
- `agent-roles-and-responsibilities.md`
- `ci-gates-policy.md`
- `escalation-matrix.md`

Examples:

- A proposed workflow change should be cross-checked against DoR/DoD and CI gate
  policy here.

Onboarding note: Read this folder first to understand what “done” and “ready”
mean in this repo.

<a id="nexus-delivery-01-product"></a>

## nexus_delivery/01_product

Purpose: Product direction and planning horizon artifacts.

Typical files and subdirectories:

- `product_vision.md`
- `product_roadmap.md`
- `release_plan.md`

Examples:

- New feature proposals should align with themes in the roadmap and constraints
  in release planning.

Onboarding note: Use this folder to validate that implementation work serves
intended outcomes, not just technical preferences.

<a id="nexus-delivery-02-backlog"></a>

## nexus_delivery/02_backlog

Purpose: Execution backlog hierarchy and dependency tracking.

Typical files and subdirectories:

- `epics.md`
- `features.md`
- `user_stories.md`
- `tasks.md`
- `dependencies.md`
- `refinement-log/`

Examples:

- A new story should trace back to a feature and epic and have concrete task
  breakdown references.

Onboarding note: Keep relationship integrity strict: Epic -> Feature -> Story ->
Task.

<a id="nexus-delivery-02-backlog-refinement-log"></a>

## nexus_delivery/02_backlog/refinement-log

Purpose: Captures backlog grooming decisions and refinement outcomes over time.

Typical files and subdirectories:

- `README.md`

Examples:

- During planning sessions, unresolved assumptions and split/merge decisions for
  stories should be logged here.

Onboarding note: Use refinement notes to explain why backlog shape changed, not
only what changed.

<a id="nexus-delivery-03-sprints"></a>

## nexus_delivery/03_sprints

Purpose: Sprint execution container with active sprint folders and reusable
templates.

Typical files and subdirectories:

- `README.md`
- `SPR-00-bootstrap/`
- `SPR-01-intent-core/`
- `templates/`

Examples:

- Each sprint folder stores plan, daily/change log, retrospective, and velocity
  snapshot.

Onboarding note: Do not create ad hoc sprint artifacts outside this structure;
keep sprint history consistent.

<a id="nexus-delivery-03-sprints-spr-00-bootstrap"></a>

## nexus_delivery/03_sprints/SPR-00-bootstrap

Purpose: Historical sprint package for initial delivery system bootstrap.

Typical files and subdirectories:

- `plan.md`
- `log.md`
- `retrospective.md`
- `velocity_snapshot.json`

Examples:

- `retrospective.md` records process lessons used to improve next sprint.

Onboarding note: Use completed sprint folders as examples for expected evidence
quality.

<a id="nexus-delivery-03-sprints-spr-01-intent-core"></a>

## nexus_delivery/03_sprints/SPR-01-intent-core

Purpose: Historical sprint package focused on intent governance core
capabilities.

Typical files and subdirectories:

- `plan.md`
- `log.md`
- `retrospective.md`
- `velocity_snapshot.json`

Examples:

- Sprint logs capture when scope changed and why those decisions were made.

Onboarding note: Reference this sprint when onboarding to intent-model
implementation context.

<a id="nexus-delivery-03-sprints-templates"></a>

## nexus_delivery/03_sprints/templates

Purpose: Templates that standardize sprint artifact shape and traceability.

Typical files and subdirectories:

- `sprint-plan-template.md`
- `sprint-log-template.md`
- `retrospective-template.md`
- `velocity-snapshot-template.json`

Examples:

- New sprint kickoff should begin by copying these templates into the new sprint
  folder.

Onboarding note: Using templates keeps metrics and governance checks
automatable.

<a id="nexus-delivery-04-decisions"></a>

## nexus_delivery/04_decisions

Purpose: Architecture and delivery decision records.

Typical files and subdirectories:

- `README.md`
- `ADR-000-template.md`
- `ADR-001-runtime-fastapi.md`
- `agent-decision-log/`

Examples:

- `ADR-001-runtime-fastapi.md` records the runtime decision and supporting
  rationale.

Onboarding note: Decision records should be immutable once accepted; supersede
with a new ADR instead of overwriting history.

<a id="nexus-delivery-04-decisions-agent-decision-log"></a>

## nexus_delivery/04_decisions/agent-decision-log

Purpose: Log stream for agent-generated decisions affecting implementation
scope, trade-offs, or execution plans.

Typical files and subdirectories:

- `README.md`

Examples:

- A significant autonomous recommendation that changes sprint scope should be
  captured here with references.

Onboarding note: This folder improves accountability for machine-assisted
planning choices.

<a id="nexus-delivery-05-sessions"></a>

## nexus_delivery/05_sessions

Purpose: Session-level facilitation templates and traceability records for
recurring team ceremonies.

Typical files and subdirectories:

- `README.md`
- `daily-scrum-template.md`
- `decision-brief-template.md`
- `session-log-template.md`
- `logs/`

Examples:

- Use `decision-brief-template.md` when a meeting yields a scoped action with
  architectural implications.

Onboarding note: Treat session artifacts as short-form evidence linked back to
stories and sprints.

<a id="nexus-delivery-05-sessions-logs"></a>

## nexus_delivery/05_sessions/logs

Purpose: Storage location for completed session logs produced from templates.

Typical files and subdirectories:

- `README.md`

Examples:

- A daily scrum output can be stored here with date and sprint references.

Onboarding note: Consistent naming here makes chronology and audit retrieval
easier.

<a id="nexus-delivery-06-metrics"></a>

## nexus_delivery/06_metrics

Purpose: Delivery performance and quality measurement artifacts.

Typical files and subdirectories:

- `metrics_framework.md`
- `velocity_tracking.json`
- `quality_metrics.json`
- `odr_tracking.md`
- `dashboards/`

Examples:

- `velocity_tracking.json` stores sprint throughput snapshots.
- `quality_metrics.json` tracks pass/fail oriented quality indicators.

Onboarding note: Update metrics alongside sprint closure, not long after, to
prevent stale reporting.

<a id="nexus-delivery-06-metrics-dashboards"></a>

## nexus_delivery/06_metrics/dashboards

Purpose: Dashboard scaffolds and visual templates for delivery analytics.

Typical files and subdirectories:

- `sprint_burndown_template.html`

Examples:

- A PM can adapt the burndown template for each sprint review packet.

Onboarding note: Keep dashboards derived from canonical metric files to avoid
conflicting numbers.

<a id="nexus-delivery-07-releases"></a>

## nexus_delivery/07_releases

Purpose: Release readiness rules and artifact bundle definition.

Typical files and subdirectories:

- `asdlc-bundle-spec.md`
- `release-checklist.md`

Examples:

- `release-checklist.md` ensures required evidence is complete before shipping.

Onboarding note: No release should bypass this folder’s checklist/guidelines.

<a id="nexus-delivery-08-risks"></a>

## nexus_delivery/08_risks

Purpose: Risk identification, ownership, and mitigation planning.

Typical files and subdirectories:

- `risk-register.md`

Examples:

- New dependency or architecture risks should be added with likelihood, impact,
  owner, and mitigation status.

Onboarding note: Review risks during sprint planning and release readiness
checks.

<a id="nexus-delivery-09-templates"></a>

## nexus_delivery/09_templates

Purpose: Reusable templates for backlog, planning, testing, and release
communication artifacts.

Typical files and subdirectories:

- `README.md`
- `epic-template.md`
- `feature-template.md`
- `user-story-template.md`
- `task-template.md`
- `test-plan-template.md`
- `pr-checklist-template.md`
- `release-notes-template.md`

Examples:

- A new feature proposal should start from `feature-template.md` to enforce
  consistent traceability sections.

Onboarding note: Prefer template reuse over creating custom one-off structures.

<a id="nexus-delivery-10-guidance"></a>

## nexus_delivery/10_guidance

Purpose: Onboarding and orientation materials for contributors and agent
workflows.

Typical files and subdirectories:

- `README.md`
- `guidance.md` (this file)

Examples:

- New joiners can read this folder first to understand directory
  responsibilities before touching implementation code.

Onboarding note: Keep this folder concise and current; outdated guidance creates
systemic drift.

<a id="nexus-web"></a>

## nexus_web

Purpose: Frontend web app workspace (Vite + React + Tailwind toolchain).

Typical files and subdirectories:

- `package.json`, `package-lock.json`
- `vite.config.js`, `tailwind.config.js`, `eslint.config.js`
- `index.html`
- `public/`
- `src/`

Examples:

- UI behavior and page composition changes are implemented here for the web app.

Onboarding note: Use this workspace for browser-facing product UI, separate from
workbench UI in `src/ui`.

<a id="nexus-web-public"></a>

## nexus_web/public

Purpose: Static assets served directly by the web app build/runtime.

Typical files and subdirectories:

- `favicon.svg`
- `icons.svg`

Examples:

- Brand imagery or static icon bundles used globally should be placed here.

Onboarding note: Use this for immutable or direct-served assets rather than
import-driven module assets.

<a id="nexus-web-src"></a>

## nexus_web/src

Purpose: Main frontend source code for `nexus_web` application logic and
styling.

Typical files and subdirectories:

- `main.jsx`
- `App.jsx`
- `index.css`
- `App.css`
- `assets/`

Examples:

- Route-level composition and shared layout components originate here.

Onboarding note: Keep app source modular and aligned with lint/build constraints
in this workspace.

<a id="nexus-web-src-assets"></a>

## nexus_web/src/assets

Purpose: Bundled frontend assets imported by the app source.

Typical files and subdirectories:

- `hero.png`
- `react.svg`
- `vite.svg`

Examples:

- Component-local visuals referenced via imports in JSX/CSS belong here.

Onboarding note: Place optimized assets here when they are part of the module
graph.

<a id="src"></a>

## src

Purpose: Core platform source root for backend APIs, prompt templates, and the
workbench UI package.

Typical files and subdirectories:

- `__init__.py`
- `api/`
- `templates/`
- `ui/`

Examples:

- Service logic and agent integration code is developed under `src/api`.

Onboarding note: This tree powers platform runtime behavior and internal
tooling.

<a id="src-api"></a>

## src/api

Purpose: Backend service and agent integration layer.

Typical files and subdirectories:

- `main.py`
- `models.py`
- `mgt_agent.py`
- `gemini_service.py`
- `web_agent_api.py`
- `test_gemini_harness.py`
- `FEATURE_MANIFEST.md`

Examples:

- `main.py` is typically service entrypoint wiring.
- `models.py` defines schemas/contracts consumed by endpoints and agents.
- `FEATURE_MANIFEST.md` provides traceability mapping between implementation and
  backlog identifiers.

Onboarding note: When adding endpoints or integrations, update manifest
traceability and tests in lockstep.

<a id="src-templates"></a>

## src/templates

Purpose: Prompt/template library for system workflows and synthesis operations.

Typical files and subdirectories:

- `master_genesis.md`
- `local_first_collaborative.md`
- `templates.json`

Examples:

- A new orchestration mode can be introduced by adding prompt assets and
  metadata references here.

Onboarding note: Treat template changes as behavior changes; version and review
carefully.

<a id="src-ui"></a>

## src/ui

Purpose: Workbench UI project and build configuration for internal platform
interactions.

Typical files and subdirectories:

- `main.tsx`
- `NexusWorkbench.tsx`
- `index.html`
- `index.css`
- `package.json`, `package-lock.json`
- `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`

Examples:

- Internal operator-facing UX changes are implemented here rather than in
  `nexus_web`.

Onboarding note: Remember there are two frontend contexts in this repo
(`nexus_web` and `src/ui`) with different scopes.

<a id="tests"></a>

## tests

Purpose: Repository-level test suite and test governance helpers.

Typical files and subdirectories:

- `test_sections.py`
- `conftest.py`
- `markers_registry.yaml`
- `README.md`

Examples:

- `conftest.py` centralizes pytest fixtures/config used across tests.
- `markers_registry.yaml` documents and standardizes test markers.

Onboarding note: Add tests with explicit traceability to features/stories and
keep marker metadata current.

<a id="quick-placement-heuristics"></a>

## Quick Placement Heuristics

- Put governance/process artifacts under `nexus_delivery`, not under `docs` or
  arbitrary root files.
- Put operational scripts under `00_ops/scripts/*`.
- Put backend/runtime logic under `src/api`.
- Put customer-facing web UX in `nexus_web`.
- Put internal workbench UX in `src/ui`.
- Put repeatable test logic under `tests` and update marker registry when
  needed.
