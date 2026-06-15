# Acceptance Policy

Acceptance gates are merge controls. Treat them as evidence-backed requirements, not checklist decoration.

## Required Gate Types

Choose gates that fit the issue. Most issues should include at least three:

- Test evidence: unit, integration, E2E, regression, or manual verification.
- Diff scope: confirms the changed files match the ADR and avoid unrelated refactors.
- Review evidence: reviewer approval, human acceptance, or explicit blocked state.
- Risk evidence: rollback plan, security/privacy review, migration impact, API compatibility, or customer support note.
- Visual evidence: screenshot or visual regression result for UI changes.

## Done Criteria

Set a gate to `done: true` only after recording evidence. Acceptable evidence includes:

- Passing command output or CI result.
- Reviewer or human approval.
- Screenshot, trace, log, or reproduction result.
- Clear statement that a risk does not apply, with reason.

Do not mark a gate done because an agent intends to run a check later.

## ADR Status Rules

- `pending`: the decision is proposed but not accepted.
- `needs-revision`: the decision is rejected, contradicted by evidence, incomplete, or unsafe.
- `accepted`: the decision is reviewed and the implementation follows it.

High-risk issues should stay `merge: "hold"` while any ADR is `pending` or `needs-revision`.

## Merge Readiness

Set `merge: "pass"` only when every ADR is accepted and every required gate is done. If any gate is blocked or any ADR needs revision, set `merge: "hold"`. If work is simply in progress, set `merge: "wait"`.

When acceptance is partial, summarize the missing gates in the final report instead of claiming readiness.
