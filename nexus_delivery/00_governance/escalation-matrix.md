# Escalation Matrix

## Purpose

Define when work must escalate from agent execution to human decision.

## Escalation Triggers

1. Security: any critical/high security finding.
2. Scope: sprint scope change greater than 20 percent of planned effort.
3. Architecture: any change that introduces new runtime components or interface contracts.
4. Compliance: missing Story linkage, missing session trace, or missing required approvals.
5. Reliability: repeated test instability affecting release confidence.

## Escalation Levels

1. Level 1 (Team)
: Resolve within sprint if low risk and within current architecture.
2. Level 2 (PO + Architect)
: Required for medium-risk scope or design conflicts.
3. Level 3 (Human Approver)
: Required for security, release-blocking, or policy exceptions.

## SLA Targets

1. Level 1 response: same working day.
2. Level 2 response: within 24 hours.
3. Level 3 response: within 48 hours.
