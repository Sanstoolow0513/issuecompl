---
name: workpanel-orchestrator
description: Coordinate coding-agent issue work through a versioned workpanel protocol with ADR decisions, acceptance gates, branch/worktree isolation, merge readiness, and panel data synchronization. Use when Codex needs to update workpanel state, resolve product bugs or issues under human-controlled decision review, manage multiple concurrent agent branches, produce or verify ADR entries, collect acceptance evidence, or sync structured issue status into the workpanel UI.
---

# Workpanel Orchestrator

## Overview

Use this skill to make workpanel a control protocol for coding agents, not page copy. Treat issue state, ADR entries, acceptance evidence, and merge readiness as versioned artifacts that a panel can render.

## Core Workflow

Follow this order for each issue:

1. Intake: identify issue id, product, branch, owner, agent, risk, current stage, and likely blast radius.
2. ADR: record each meaningful decision with context, decision, consequence, and status before or alongside code edits.
3. Patch: keep implementation work isolated by issue branch or worktree.
4. Checks: attach evidence for tests, diff scope, screenshots, logs, security, or migration impact as applicable.
5. Review: update ADR status from pending to accepted or needs-revision based on review.
6. Merge: mark merge readiness only after all ADRs are accepted and all required acceptance gates are done.

## State Model

Prefer `workpanel/issues.json` as the source of truth. If the current panel still stores fixtures in `app.js`, update the JSON first and then sync the panel fixture from it.

Read these references when needed:

- `references/workflow.md`: read before substantial issue work, multi-agent orchestration, or branch arbitration.
- `references/state-schema.md`: read before creating or changing workpanel state files.
- `references/acceptance-policy.md`: read before setting acceptance gates, ADR status, or merge readiness.

## Branch And Worktree Rules

Use one branch or worktree per issue when making code changes. Name branches with the issue id, such as `fix/pay-1842-coupon-total` or `workpanel/pay-1842-status`. Keep orchestration-only changes separate from product-code issue branches when practical.

Before merging issue work, check for branch conflicts, unresolved review, missing evidence, and ADRs that are pending or need revision.

## Validation And Sync

Use the bundled scripts from the skill directory:

```bash
python3 scripts/validate_state.py workpanel/issues.json
python3 scripts/sync_panel_data.py workpanel/issues.json --app-js app.js
```

Run validation after changing state and before reporting merge readiness. Use `sync_panel_data.py` only when the panel still needs a generated JavaScript fixture; if the panel reads JSON directly, do not rewrite `app.js`.

## Reporting

When reporting workpanel progress, include:

- Issue id and branch/worktree.
- Current stage and merge status.
- ADR entries created or updated.
- Acceptance gates changed and evidence attached.
- Validation and sync commands run.
- Remaining blockers requiring human decision.
