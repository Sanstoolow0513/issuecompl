# Acceptance checklist

Use this checklist to verify the current `workpanel` prototype against the goal in `temp.md`.

## Functional checks

- The page opens from `index.html` without installing dependencies.
- The first viewport shows issue queue, resolution map, ADR ledger and acceptance gates.
- Selecting an issue updates the resolution map, ADR ledger, acceptance gates and merge contract.
- The issue filters show all issues, ADR-pending issues, blocked issues and ready issues.
- Sorting changes the visible issue order by risk, stage or ETA.
- Approving or revising an ADR changes the decision state and metrics.
- Checking or unchecking acceptance gates changes acceptance percentage and merge readiness.
- Merge train entries select the corresponding issue.
- Batch review accepts pending ADRs only when the issue has enough acceptance evidence.
- Issue data is sourced from `workpanel/issues.json` and mirrored to `workpanel/issues-data.js`.
- `validate_state.py` accepts the current `workpanel/issues.json`.

## Decision quality checks

- Every sample issue has at least one ADR entry.
- Each ADR entry contains context, decision, consequence and status.
- High-risk issues cannot appear as merge-ready while ADRs are pending or revised.
- The merge contract exposes branch, decision, acceptance and merge state together.

## Visual checks

- Desktop layout keeps queue, map and gate controls visible at the same time.
- Mobile layout stacks panels without horizontal text overlap.
- Status colors distinguish pass, wait, hold, running and review states.
- The resolution map highlights the selected issue stage and blocked path.

## Current known limits

- Runtime changes are in-memory only and reset on refresh.
- Agents should edit `workpanel/issues.json`; `workpanel/issues-data.js` must be regenerated for static browser use.
- No real agent, git, CI or issue tracker integration is connected yet.
