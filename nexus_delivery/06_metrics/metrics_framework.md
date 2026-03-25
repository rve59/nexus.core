# Metrics Framework

## Delivery Metrics

1. Sprint commitment reliability = completed committed stories / total committed stories.
2. Lead time for changes = PR open to merge time.
3. Cycle time per story = in progress to done.

## Quality Metrics

1. Unit test pass rate.
2. Integration test pass rate.
3. Drift detection fail rate.
4. Escaped defect count per release.

## Governance Metrics

1. Story-to-PR linkage coverage.
2. Decision log coverage for architecture changes.
3. ASDLC bundle completeness.

## Capture Cadence

1. Sprint close: update velocity and quality snapshots.
2. Release cut: update release-quality and drift trend snapshots.
3. Monthly: review governance trend deltas and corrective actions.

## Metrics Artifacts

1. `velocity_tracking.json`
2. `quality_metrics.json`
3. `odr_tracking.md`
