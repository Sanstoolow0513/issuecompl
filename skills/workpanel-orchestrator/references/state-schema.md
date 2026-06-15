# Workpanel State Schema

Prefer `workpanel/issues.json` as the source of truth. A panel can mirror this data into JavaScript, a database, or a tracker integration, but agents should update the structured state first.

## Root

The root may be either an array of issues or an object with an `issues` array:

```json
{
  "issues": []
}
```

## Issue

Required issue fields:

```json
{
  "id": "PAY-1842",
  "title": "Checkout total drifts after coupon rollback",
  "product": "billing-web",
  "severity": "high",
  "risk": "high",
  "stage": "ADR",
  "agent": "codex-a17",
  "branch": "fix/pay-1842-coupon-total",
  "owner": "Mina",
  "eta": "35m",
  "merge": "wait",
  "decisions": [],
  "acceptance": [],
  "signals": {
    "tests": "not run",
    "diff": "+0 -0",
    "review": "not started",
    "rollback": "unknown"
  }
}
```

## Enums

Use these values unless the panel and validator are updated together:

- `stage`: `Intake`, `ADR`, `Patch`, `Checks`, `Review`, `Merge`
- `severity`: `low`, `medium`, `high`
- `risk`: `low`, `medium`, `high`
- `merge`: `wait`, `hold`, `pass`
- `decision.status`: `pending`, `needs-revision`, `accepted`

## ADR Entry

Each issue must have at least one ADR entry before it can move beyond `ADR`:

```json
{
  "id": "adr-1842-1",
  "title": "Move coupon rollback into pricing reducer",
  "context": "State mutation happens in both cart and payment views.",
  "decision": "Normalize rollback in the reducer and keep UI as a pure renderer.",
  "consequence": "Lower UI drift, requires reducer regression coverage.",
  "status": "pending"
}
```

Use short, reviewable decision text. Do not store implementation logs in ADR entries.

## Acceptance Gate

Each gate represents evidence, not intent:

```json
{
  "label": "Unit tests cover coupon add, remove, rollback",
  "done": false,
  "evidence": "npm test -- pricing-reducer"
}
```

`evidence` is optional, but add it when available. A gate can be `done: true` only when evidence exists in command output, review, screenshot, log, issue tracker, or a human decision.

## Merge Invariants

An issue can use `merge: "pass"` only when:

- Every ADR status is `accepted`.
- Every acceptance gate has `done: true`.
- The branch has no unresolved merge conflict.
- The reviewer or human control point does not require a hold.

Use `merge: "hold"` for blockers. Use `merge: "wait"` for normal in-progress or queued work.

## Panel Synchronization

For the current static panel shape, `signals.tests`, `signals.diff`, `signals.review`, and `signals.rollback` are rendered directly. Keep them short enough to fit compact cards.

If the panel still has `const issues = [...]` in `app.js`, generate or replace that fixture from `workpanel/issues.json` with `scripts/sync_panel_data.py`.
