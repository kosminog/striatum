# Technical document types

Each type has a fixed skeleton. Reorder only with a reason.

## README

1. One sentence: what it is and for whom.
2. Install and first working example, together, above the fold.
3. Usage: the three most common tasks, one example each.
4. Configuration table (name, type, default, effect).
5. Development: how to run tests and contribute.
6. Links: full docs, changelog, licence.

Keep under 300 lines. Anything longer becomes a docs site.

## API reference

Per endpoint or function:

1. Signature or `METHOD /path`.
2. One sentence of purpose.
3. Parameters table: name, type, required, default, constraints.
4. Request example with real values.
5. Response example, success first, then each error with its code and cause.
6. Notes: rate limits, idempotency, pagination, permissions.

Generate from source where possible. Hand-written references drift.

## Runbook

Written for someone woken at 3 a.m. who has never seen the system.

1. **Symptom**: the alert text or user report, verbatim.
2. **Impact**: who is affected, how badly, what the clock is.
3. **Check**: commands to confirm and narrow, with expected output.
4. **Fix**: numbered steps, one action each, with the verification after each.
5. **Rollback**: how to undo the fix.
6. **Escalate**: who, how, when.
7. **After**: what to record, what ticket to open.

No background section. Link to the architecture note instead.

## Architecture or design note

1. **Context**: the problem and constraints, in the present tense.
2. **Decision**: one paragraph, stated plainly.
3. **Options considered**: each with why it lost.
4. **Consequences**: what gets easier, what gets harder, what is now owed.
5. **Status** and date.

An ADR that does not list a rejected option was not a decision.

## How-to guide

Title is the task in the imperative ("Rotate the signing key").

1. Goal and prerequisites, two lines.
2. Numbered steps. Each step: one action, the exact command or click, the expected
   result.
3. Verification: how to know it worked.
4. Troubleshooting: the two or three failures people actually hit.

## Changelog entry

```
## 2.4.0 — 2026-09-29
### Added
- `jobs.retry()` re-runs a failed job with the same inputs.
### Changed
- `Client` now retries 429 responses up to 3 times. Set `maxRetries: 0` to disable.
### Fixed
- Export no longer truncates rows containing newlines.
### Breaking
- `Client.timeout` is now milliseconds, not seconds. Multiply existing values by 1000.
```

Write for the upgrader: what they must do, in the entry, not in a linked issue.

## Error message

Three parts, in order: what happened, why (if known), what to do.

> Could not connect to the database at db.internal:5432. Connection refused.
> Check that the database is running and that `DATABASE_URL` points to it.

No exclamation marks, no apologies, no blame, no jokes. Include the identifier the
reader will search for.

## Code comment

Explain why, not what. If the what needs explaining, rename the thing. Delete
comments that restate the line below them. Date and attribute anything that is a
workaround so it can be removed.
