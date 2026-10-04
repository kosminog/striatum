# Pull request description

Use the repository's PR template when one exists. Otherwise:

```
## What
One or two sentences: the change, in terms of behaviour.

## Why
The problem or request, and anything that constrained the solution.

## How to verify
Numbered steps a reviewer can follow, or the commands and their expected output.

## Notes for reviewers
Migrations, new or changed environment variables, updated visual baselines,
deliberately deferred follow-ups, anything surprising in the diff.
```

Leave out any section that would be empty rather than writing "N/A".

## Example

```
## What
Reject expired refresh tokens before rotating them.

## Why
Rotation issued a fresh access token even after the refresh token had expired,
because the expiry check ran after the write. Reported in #211.

## How to verify
1. `pnpm test -- auth/rotation` — new case `rejects expired refresh token`.
2. Manually: set `REFRESH_TTL=1`, sign in, wait two seconds, call `/api/refresh`.
   Expect 401.

## Notes for reviewers
No migration. `docs/auth.md` already described this behaviour; no doc change.
```

## Title

Same rules as a commit subject. When the PR holds one commit, reuse its subject.
When it holds several, summarise the user-visible outcome, not the list.
