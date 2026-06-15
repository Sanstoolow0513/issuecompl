# ADR 0001: Decision and acceptance first issue workpanel

## Status

Accepted

## Context

The target workflow is not a simple issue board. A developer wants to let coding agents resolve several product issues concurrently while keeping every meaningful decision visible, controllable, and reviewable. The source goal in `temp.md` asks for an ADR-like method where the human can control each step and where review can be automated.

Current coding agent tools are efficient at local edits, but weak at cross-issue orchestration:

- Parallel issue work is hard to compare in one place.
- Decision rationale often lives only in chat history.
- Acceptance evidence is mixed with implementation logs.
- Merge readiness is unclear when several agents touch related code.

## Decision

Build `workpanel` as a static, inspectable prototype with four connected surfaces:

1. Issue Queue: displays risk, stage, branch, owner, agent and merge state.
2. Resolution Map: visualizes each issue from intake through ADR, patch, checks, review and merge.
3. ADR Ledger: records context, decision, consequence and decision status for each key choice.
4. Acceptance Gates: tracks evidence required before an issue can enter merge readiness.

The first implementation is dependency-free HTML, CSS and JavaScript so the artifact can be opened directly, reviewed quickly, and changed without build tooling.

## Consequences

- The prototype is easy to inspect and demo.
- The sample data can later be replaced by GitHub Issues, Linear, Jira, local git branches or agent run logs.
- ADR and acceptance are first-class project concepts, not side notes.
- The static version does not yet persist state or call real agent tools.

## Follow-up ADR Candidates

- How to map external issue systems into the internal issue schema.
- How to verify an agent-produced ADR against code diff and tests.
- How to arbitrate conflicting patches across concurrent agent branches.
- How to decide whether acceptance can be automatic, manual or hybrid.
