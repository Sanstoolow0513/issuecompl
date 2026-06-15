# Workpanel Workflow

Use workpanel as a human-controllable orchestration layer for coding agents. The panel should show what an agent is doing, why a decision was made, what evidence exists, and whether an issue is safe to merge.

## Issue Lifecycle

1. Intake
   - Capture issue id, product, title, risk, severity, owner, agent, branch, and ETA.
   - Set stage to `Intake` until the agent has enough context to propose decisions.
   - Mark high-risk issues conservatively when they touch payments, auth, data loss, migrations, security, privacy, permissions, or public APIs.

2. ADR
   - Create at least one ADR entry before risky code changes.
   - Use context, decision, consequence, and status.
   - Keep status `pending` until the human or reviewer accepts it.
   - Use `needs-revision` when the approach is rejected, incomplete, or contradicted by evidence.

3. Patch
   - Isolate implementation in one branch or worktree per issue.
   - Keep unrelated refactors out of issue branches.
   - Update state when the code stage advances, but do not mark acceptance complete without evidence.

4. Checks
   - Attach test results, diff summary, review state, screenshots, logs, or rollback notes.
   - For failed checks, leave the gate undone and record the blocking signal.

5. Review
   - Compare the diff and evidence against the ADR decision.
   - Update ADR status only when the decision is actually reviewed.
   - If the code diverges from the accepted ADR, add a new ADR entry or mark the old one `needs-revision`.

6. Merge
   - Mark `merge` as `pass` only when every ADR is `accepted` and every acceptance gate is done.
   - Use `wait` when work is progressing or review is queued.
   - Use `hold` when there is a blocker, conflict, missing decision, or unresolved high-risk evidence.

## Worktree Protocol

Use worktrees to make parallel issue work visible and reversible:

```bash
git worktree add -b fix/<issue-id>-<short-slug> ../<repo>-<issue-id> <base-branch>
```

Keep the issue branch name in workpanel state. When an agent finishes a branch, validate state, run checks, and merge only after ADR and acceptance gates pass.

## Human Control Points

Stop for human review when:

- An ADR is `pending` and the issue is high risk.
- A decision changes public behavior, persistence, security, privacy, billing, or compatibility.
- A merge requires choosing between conflicting agent branches.
- Acceptance evidence is manual, ambiguous, or missing.

## Multi-Agent Arbitration

When multiple agents touch related code:

- Compare branch diffs and affected files before merge.
- Prefer the branch whose ADR matches the accepted decision and whose evidence is complete.
- Add a new ADR if the final merge combines approaches from multiple branches.
- Keep blocked or rejected branches visible with `merge: "hold"` until they are closed or revised.
