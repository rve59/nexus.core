# ASDLC Transaction Bundle Spec

The canonical release bundle is:

`Commit = { Code_Delta, MGT_v, Session_trace, Audit_report }`

## Required Fields

1. `code_delta`: commit hash or PR merge reference.
2. `mgt_version`: intent version used for implementation.
3. `session_trace`: references to session logs.
4. `audit_report`: validation outputs and status.
5. `story_ids`: implemented story identifiers.
6. `task_ids`: completed task identifiers.
7. `adr_refs`: decision references if architecture changed.

## Validation Rules

1. Missing field = invalid release bundle.
2. `mgt_version` must match manifest at merge time.
3. `audit_report.status` must be PASS for production release.
4. `story_ids` and `task_ids` must resolve to backlog records.
5. `session_trace` entries must follow session naming convention.
