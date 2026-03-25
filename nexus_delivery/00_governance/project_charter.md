# Project Charter: Nexus.core

## Purpose

Build Nexus.core as an intent-first agentic software delivery platform that
orchestrates GAS, GitHub, and GAG/Copilot with strong governance.

## Scope

- In scope:
  - MGT intent definition and version control.
  - Multi-agent orchestration and handoff lifecycle.
  - Audit and drift detection between intent and code.
  - FastAPI service tier and React/Tailwind workbench.
  - Python-only backend implementation.
- Out of scope (v1):
  - Multi-tenant enterprise billing.
  - Non-GitHub SCM providers.
  - Full no-code workflow editor.

## Success Criteria

1. Intent-to-code traceability for 100 percent of merged features.
2. Automated drift detection gate in CI for all PRs.
3. End-to-end roundtrip between GAS -> GitHub -> GAG with audit artifacts.
4. Sprint predictability >= 80 percent commitment completion by Sprint 3.

## Constraints

1. Service standard: FastAPI.
2. Backend language: Python.
3. Frontend stack: React + Tailwind.

## Roles

- Product Owner: user (strategy, prioritization, acceptance).
- Lead PM Agent: Copilot in VS Code (backlog ops, traceability, sprint execution
  support).
- Lead Architect: Copilot + human review.
- Engineering Team: GAS, GAG/Copilot, and human-in-the-loop.

## Governance Enforcement Model

1. Hybrid CI gates are used: critical quality and traceability checks are
   blocking, process-maturity checks are advisory.
2. Escalation thresholds and approval authority are governed by
   `00_governance/escalation-matrix.md`.
3. Agent responsibilities and decision boundaries are governed by
   `00_governance/agent-roles-and-responsibilities.md`.
