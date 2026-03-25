# User Stories

## Traceability Checklist

Every story should reference:

1. Feature ID
2. Planned task IDs
3. Planned test scope
4. Session evidence once implemented
5. ADR link when architecture changes are involved

## Sprint 1 Candidate Stories

### US-01-01-001 (FT-01-01)

As a product owner, I want MGT schema validation so that only compliant intent
artifacts enter development.

Acceptance Criteria:

1. Invalid MGT documents are rejected with actionable errors.
2. Valid MGT documents are persisted with version metadata.
3. Unit and integration tests cover pass/fail scenarios.

### US-01-02-001 (FT-01-02)

As a lead architect, I want every code stream linked to a specific intent
version so that implementation is auditable.

Acceptance Criteria:

1. Manifest stores current `intent_v` and updated timestamps.
2. API updates `intent_v` on approved intent changes.
3. Missing linkage is detectable by CI policy checks.

### US-02-01-001 (FT-02-01)

As a consultant agent, I want a deterministic state machine so that synthesis
phases are reproducible.

Acceptance Criteria:

1. Allowed transitions are enforced.
2. Invalid transitions return explicit errors.
3. Workflow tests cover normal and failure paths.

### US-04-01-001 (FT-04-01)

As an engineering lead, I want a structured pytest pyramid so that failures are
isolated and fast to diagnose.

Acceptance Criteria:

1. Test markers exist for unit, integration, contract, workflow, and e2e.
2. CI runs tiered suites with clear reporting.
3. Baseline fixture package is reusable.
