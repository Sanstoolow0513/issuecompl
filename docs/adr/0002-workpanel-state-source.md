# ADR 0002: Versioned workpanel state source

## Status

Accepted

## Context

The first prototype kept issue examples directly inside `app.js`. That made the panel easy to open, but it meant coding agents had to edit UI code to synchronize issue status, ADR decisions, acceptance gates, and merge readiness.

The target workflow needs a panel that displays state while agents modify structured artifacts.

## Decision

Use `workpanel/issues.json` as the source of truth for issue, ADR, acceptance, and signal state.

Generate `workpanel/issues-data.js` from that JSON for the dependency-free static page. `index.html` loads the generated data before `app.js`, and `app.js` reads `globalThis.WORKPANEL_ISSUES` instead of owning the fixture.

## Consequences

- Coding agents can update versioned JSON state without touching UI behavior.
- The static page still opens directly without a development server or browser JSON fetch permissions.
- The generated `issues-data.js` must be refreshed after state changes.
- Runtime UI interactions still mutate memory only until a persistence layer exists.
