# Agentic Scrum Onboarding Guidance

This guide explains the purpose of each tracked directory in Nexus.core and
provides a practical onboarding path for human and agent contributors.

## Scope

This document covers tracked repository directories only.

Tracked top-level directories in scope:

- [00_ops](../../00_ops)
- [blueprint](../../blueprint)
- [.github](../../.github)
- [nexus_delivery](../)
- [nexus_web](../../nexus_web)
- [src](../../src)
- [tests](../../tests)

Root tracked files that influence behavior:

- [.gitignore](../../.gitignore)
- [.python-version](../../.python-version)

## Directory Scan (One Level Deeper)

This is the tracked directory map up to depth 2:

- [00_ops](../../00_ops)
- [00_ops/scripts](../../00_ops/scripts)
- [blueprint](../../blueprint)
- [blueprint/7b4e418c-698f-4de3-ab74-ba0161a6a552](../../blueprint/7b4e418c-698f-4de3-ab74-ba0161a6a552)
- [blueprint/7c50d6d8-a336-466c-b5c1-27b78a55a86f](../../blueprint/7c50d6d8-a336-466c-b5c1-27b78a55a86f)
- [.github](../../.github)
- [.github/workflows](../../.github/workflows)
- [nexus_delivery](../)
- [nexus_delivery/00_governance](../00_governance)
- [nexus_delivery/01_product](../01_product)
- [nexus_delivery/02_backlog](../02_backlog)
- [nexus_delivery/03_sprints](../03_sprints)
- [nexus_delivery/04_decisions](../04_decisions)
- [nexus_delivery/05_sessions](../05_sessions)
- [nexus_delivery/06_metrics](../06_metrics)
- [nexus_delivery/07_releases](../07_releases)
- [nexus_delivery/08_risks](../08_risks)
- [nexus_delivery/09_templates](../09_templates)
- [nexus_web](../../nexus_web)
- [nexus_web/public](../../nexus_web/public)
- [nexus_web/src](../../nexus_web/src)
- [src](../../src)
- [src/api](../../src/api)
- [src/templates](../../src/templates)
- [src/ui](../../src/ui)
- [tests](../../tests)

## Directory Purpose

### 00_ops

Operational scripts and runtime support utilities.

- [scripts/runtime](../../00_ops/scripts/runtime): restart and runtime
  management scripts.
- [scripts/health](../../00_ops/scripts/health): service health and heartbeat
  checks.

Use this area for local operational control and incident triage automation.

### blueprint

Structured discovery and planning artifacts for initiative streams/sessions.

- Stream-specific subdirectories store architecture, intent, genesis, registry,
  and schema artifacts.
- [blueprint sessions](../../blueprint/sessions) supports continuity for
  planning/exploration work when present in tracked streams.

Use this area to capture upstream intent before implementation enters backlog
and sprint execution.

### .github

Repository automation and CI workflow definitions.

- [workflows](../../.github/workflows) contains governance gates, drift
  detection, testing, and release bundle checks.

Use this area to enforce policy and quality gates from pull request to release.

### nexus_delivery

Scrum and governance operating system for Nexus.core delivery.

- [00_governance](../00_governance): charter, DoR/DoD, gates, roles, escalation
  policy.
- [01_product](../01_product): product vision, roadmap, release plan.
- [02_backlog](../02_backlog): epics, features, stories, tasks, dependencies,
  refinement log.
- [03_sprints](../03_sprints): sprint folders with plan, log, retrospective,
  velocity.
- [04_decisions](../04_decisions): ADR and decision logs.
- [05_sessions](../05_sessions): templates and session logs.
- [06_metrics](../06_metrics): delivery and quality metrics.
- [07_releases](../07_releases): ASDLC bundle specification and release
  checklist.
- [08_risks](../08_risks): risk register and mitigation tracking.
- [09_templates](../09_templates): reusable templates for planning and
  traceability.
- [10_guidance](./): onboarding and directory-purpose guidance.

Use this area as the single source of truth for delivery planning, execution,
and governance evidence.

### nexus_web

Frontend application workspace (Vite + React + Tailwind stack).

- [src](../../nexus_web/src) contains app UI source code.
- [public](../../nexus_web/public) contains static assets.

Use this area for customer-facing web UX work and frontend-specific tooling.

### src

Backend and platform implementation code.

- [api](../../src/api): service entry points, models, agent interfaces,
  integration harnesses.
- [templates](../../src/templates): prompt/template assets for system
  operations.
- [ui](../../src/ui): workbench UI implementation and build configuration.

Use this area for runtime logic and agent/platform integration.

### tests

Python test suite and test support/traceability artifacts.

Use this area to validate functional behavior and keep story-to-test mappings
explicit.

## Onboarding Path (Agentic Scrum)

1. Read governance baseline:
   - [project_charter.md](../00_governance/project_charter.md)
   - [definition_of_ready.md](../00_governance/definition_of_ready.md)
   - [definition_of_done.md](../00_governance/definition_of_done.md)
2. Understand product direction:
   - [product_vision.md](../01_product/product_vision.md)
   - [product_roadmap.md](../01_product/product_roadmap.md)
   - [release_plan.md](../01_product/release_plan.md)
3. Pull scoped work from backlog:
   - [features.md](../02_backlog/features.md)
   - [user_stories.md](../02_backlog/user_stories.md)
   - [tasks.md](../02_backlog/tasks.md)
4. Execute within active sprint:
   - [SPR-00 plan](../03_sprints/SPR-00-bootstrap/plan.md)
   - [SPR-01 plan](../03_sprints/SPR-01-intent-core/plan.md)
   - [03_sprints templates](../03_sprints/templates)
5. Preserve traceability as you build:
   - update [FEATURE_MANIFEST.md](../../src/api/FEATURE_MANIFEST.md)
   - keep tests mapped in [tests/README.md](../../tests/README.md) and
     [markers_registry.yaml](../../tests/markers_registry.yaml).
6. Record decisions and outcomes:
   - [04_decisions](../04_decisions)
   - [05_sessions/logs](../05_sessions/logs)
7. Validate release readiness:
   - [release-checklist.md](../07_releases/release-checklist.md)
   - CI workflows under [.github/workflows](../../.github/workflows)

## Working Conventions

- Link every code change to a Story ID and sprint evidence.
- Keep decision records lightweight but explicit when architecture changes.
- Treat `nexus_delivery` artifacts as auditable delivery evidence.
- Prefer additive updates over structural churn during active sprints.

## Ownership and Update Rule

Update this guide when one of the following changes:

- a tracked top-level directory is added, removed, or repurposed,
- governance structure in `nexus_delivery` changes,
- CI gates or release evidence expectations materially change.
