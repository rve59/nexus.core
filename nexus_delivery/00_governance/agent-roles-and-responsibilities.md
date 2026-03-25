# Agent Roles and Responsibilities

## Purpose

Define operating boundaries for human and agent roles in Nexus.core delivery.

## Roles

1. Product Owner / Scrum Manager Agent (Copilot)
: Owns backlog hygiene, sprint planning integrity, DoR/DoD enforcement, and traceability checks.
2. Solution Architect (human or delegated agent)
: Owns architecture coherence, ADR quality, and cross-cutting technical decisions.
3. Delivery Engineer Agent
: Implements approved scope, links code to Story IDs, updates tests and session evidence.
4. Auditor Agent
: Performs drift checks across intent, code, tests, and release artifacts.
5. Human Approver
: Final approval authority for release, exceptions, and high-risk architectural changes.

## Boundary Rules

1. Agents may propose scope changes but cannot self-approve scope expansion.
2. Any architecture-impacting change requires ADR evidence and Human Approver sign-off.
3. Any exception to blocking gates must be explicitly approved and logged in a session record.
4. Every committed Story must have at least one owner and one reviewer.
