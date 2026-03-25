# CI Gates Policy (Hybrid)

## Blocking Gates

1. All required tests pass.
2. No critical/high security findings.
3. Story ID linkage present in PR metadata.
4. Session evidence linked for implemented stories.
5. Required ADR update present for architecture changes.

## Advisory Gates

1. Refinement log updated for newly refined stories.
2. Sprint log freshness (last update within 48 hours during active sprint).
3. Retrospective action item closure trend.
4. Optional metrics completeness.

## Exception Process

1. Exception must include rationale, risk assessment, owner, and expiry date.
2. Exception must be recorded in a session log.
3. Level 3 approval is required for blocking-gate exceptions.
