# ADR-001: Service Runtime Standardization on FastAPI

## Status

Accepted

## Context

Nexus.core prototype contained both Flask and FastAPI service paths. This risks duplicate contracts and governance drift.

## Decision

Standardize service runtime on FastAPI for all service-tier APIs in Nexus.core.

## Consequences

1. Positive: Strong typing and OpenAPI-driven contract discipline.
2. Positive: Clearer CI contract checks.
3. Trade-off: Existing Flask endpoints will be deprecated/refactored.

## Traceability

- Epics: EP-02, EP-03, EP-04
- Features: FT-02-01, FT-03-02, FT-04-02
- User Stories: US-02-01-001, US-04-01-001
