# Runbook: queue backlog alert (invented service, for illustration only)

**Reader and task:** an on-call engineer paged at night who has never touched
the export service and needs the backlog cleared.

## Before

> ## Export pipeline overview
>
> The export pipeline is a critical part of our platform that handles customer
> data exports. It is built on a robust queue-based architecture. Sometimes the
> queue can back up, usually when there is a lot of load. If this happens you
> should look at the workers and probably restart them, which normally fixes it
> fairly quickly. Make sure to check the dashboards as well.

## After

> # Export queue backlog
>
> **Symptom:** alert `export_queue_depth > 5000 for 10m`.
>
> **Impact:** customer exports arrive late. No data loss; jobs stay queued.
>
> **Check**
>
> ```bash
> exportctl queue depth          # expected: a number, falling after the fix
> exportctl workers list         # expected: 4 workers in state "running"
> ```
>
> A worker in state `stalled` for over 5 minutes is the usual cause.
>
> **Fix**
>
> 1. `exportctl workers restart <id>` for each stalled worker.
> 2. Re-run `exportctl queue depth` after 2 minutes. It should drop by at least
>    200 per minute.
> 3. If depth is still rising, scale: `exportctl workers scale 8`.
>
> **Rollback:** `exportctl workers scale 4` once depth is under 500.
>
> **Escalate:** depth still rising after 15 minutes: page the data platform
> on-call (`#data-platform-oncall`).
>
> **After:** note the start time, the stalled worker ids and the fix in the
> incident channel, and open a ticket if any worker stalled twice.

## What changed

- The background paragraph went; the reader needs the alert text and the fix,
  not the architecture (lead with the task).
- "Usually", "probably", "fairly quickly" became commands with expected output
  and a number to compare against (be exact or be silent).
- Every step is one action followed by its verification, and the rollback and
  escalation path exist at all (show, then tell).
