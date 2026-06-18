#!/usr/bin/env python3
"""Validate workpanel issue state."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


STAGES = {"Intake", "ADR", "Patch", "Checks", "Review", "Merge", "Recheck", "Done"}
LEVELS = {"low", "medium", "high"}
MERGE_STATES = {"wait", "hold", "pass"}
DECISION_STATES = {"pending", "needs-revision", "accepted"}
SIGNAL_KEYS = {"tests", "diff", "review", "rollback"}
ISSUE_TYPES = {"bug", "feature"}

BUG_PHASES = {"reproduce", "diagnose", "fix", "regression_test", "verify"}
FEATURE_PHASES = {"discovery", "spec", "design", "implementation", "acceptance_test", "measure"}


def load_issues(path: Path) -> list[dict[str, Any]]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"{path}: invalid JSON: {exc}") from exc

    if isinstance(data, list):
        issues = data
    elif isinstance(data, dict) and isinstance(data.get("issues"), list):
        issues = data["issues"]
    else:
        raise ValueError(f"{path}: root must be an issue array or an object with an issues array")

    if not all(isinstance(issue, dict) for issue in issues):
        raise ValueError(f"{path}: every issue must be an object")
    return issues


def is_nonempty_string(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def validate_issue(issue: dict[str, Any], index: int) -> list[str]:
    errors: list[str] = []
    prefix = f"issues[{index}]"

    required_strings = ["id", "title", "product", "agent", "branch", "owner", "eta"]
    for field in required_strings:
        if not is_nonempty_string(issue.get(field)):
            errors.append(f"{prefix}.{field}: required non-empty string")

    if issue.get("stage") not in STAGES:
        errors.append(f"{prefix}.stage: must be one of {sorted(STAGES)}")
    if issue.get("severity") not in LEVELS:
        errors.append(f"{prefix}.severity: must be one of {sorted(LEVELS)}")
    if issue.get("risk") not in LEVELS:
        errors.append(f"{prefix}.risk: must be one of {sorted(LEVELS)}")
    if issue.get("merge") not in MERGE_STATES:
        errors.append(f"{prefix}.merge: must be one of {sorted(MERGE_STATES)}")

    issue_type = issue.get("type")
    if issue_type is not None:
        if issue_type not in ISSUE_TYPES:
            errors.append(f"{prefix}.type: must be one of {sorted(ISSUE_TYPES)}")

        phase = issue.get("phase")
        if phase is not None:
            valid_phases = BUG_PHASES if issue_type == "bug" else FEATURE_PHASES
            if phase not in valid_phases:
                errors.append(f"{prefix}.phase: must be one of {sorted(valid_phases)} for type {issue_type!r}")

    decisions = issue.get("decisions")
    if not isinstance(decisions, list) or not decisions:
        errors.append(f"{prefix}.decisions: at least one ADR entry is required")
        decisions = []

    for decision_index, decision in enumerate(decisions):
        decision_prefix = f"{prefix}.decisions[{decision_index}]"
        if not isinstance(decision, dict):
            errors.append(f"{decision_prefix}: must be an object")
            continue
        for field in ["id", "title", "context", "decision", "consequence"]:
            if not is_nonempty_string(decision.get(field)):
                errors.append(f"{decision_prefix}.{field}: required non-empty string")
        if decision.get("status") not in DECISION_STATES:
            errors.append(f"{decision_prefix}.status: must be one of {sorted(DECISION_STATES)}")

    acceptance = issue.get("acceptance")
    if not isinstance(acceptance, list) or not acceptance:
        errors.append(f"{prefix}.acceptance: at least one acceptance gate is required")
        acceptance = []

    for gate_index, gate in enumerate(acceptance):
        gate_prefix = f"{prefix}.acceptance[{gate_index}]"
        if not isinstance(gate, dict):
            errors.append(f"{gate_prefix}: must be an object")
            continue
        if not is_nonempty_string(gate.get("label")):
            errors.append(f"{gate_prefix}.label: required non-empty string")
        if not isinstance(gate.get("done"), bool):
            errors.append(f"{gate_prefix}.done: required boolean")
        if gate.get("done") is True and "evidence" in gate and not is_nonempty_string(gate.get("evidence")):
            errors.append(f"{gate_prefix}.evidence: must be non-empty when present")

    signals = issue.get("signals")
    if not isinstance(signals, dict):
        errors.append(f"{prefix}.signals: required object")
    else:
        missing = sorted(SIGNAL_KEYS - set(signals))
        if missing:
            errors.append(f"{prefix}.signals: missing keys {missing}")
        for key in SIGNAL_KEYS & set(signals):
            if not is_nonempty_string(signals.get(key)):
                errors.append(f"{prefix}.signals.{key}: required non-empty string")

    all_decisions_accepted = bool(decisions) and all(
        isinstance(decision, dict) and decision.get("status") == "accepted" for decision in decisions
    )
    all_gates_done = bool(acceptance) and all(
        isinstance(gate, dict) and gate.get("done") is True for gate in acceptance
    )
    merge_pass = issue.get("merge") == "pass"

    if merge_pass and not (all_decisions_accepted and all_gates_done):
        errors.append(f"{prefix}.merge: pass requires all ADRs accepted and all acceptance gates done")
    if issue.get("stage") == "Merge" and not (all_decisions_accepted and all_gates_done):
        errors.append(f"{prefix}.stage: Merge requires all ADRs accepted and all acceptance gates done")
    if issue.get("risk") == "high" and merge_pass and not all_decisions_accepted:
        errors.append(f"{prefix}.merge: high-risk issue cannot pass with unresolved ADRs")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate workpanel issue state JSON.")
    parser.add_argument("state", type=Path, help="Path to workpanel issue state JSON")
    args = parser.parse_args()

    try:
        issues = load_issues(args.state)
    except ValueError as exc:
        print(exc, file=sys.stderr)
        return 2

    errors: list[str] = []
    seen_ids: set[str] = set()
    for index, issue in enumerate(issues):
        issue_id = issue.get("id")
        if isinstance(issue_id, str):
            if issue_id in seen_ids:
                errors.append(f"issues[{index}].id: duplicate issue id {issue_id!r}")
            seen_ids.add(issue_id)
        errors.extend(validate_issue(issue, index))

    if errors:
        print("workpanel state is invalid:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print(f"workpanel state is valid: {len(issues)} issue(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
