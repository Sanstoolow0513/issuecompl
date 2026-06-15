#!/usr/bin/env python3
"""Sync structured workpanel state into JavaScript panel data."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


def load_issues(path: Path) -> list[dict[str, Any]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, list):
        issues = data
    elif isinstance(data, dict) and isinstance(data.get("issues"), list):
        issues = data["issues"]
    else:
        raise ValueError("state root must be an issue array or an object with an issues array")
    if not all(isinstance(issue, dict) for issue in issues):
        raise ValueError("every issue must be an object")
    return issues


def render_const(issues: list[dict[str, Any]]) -> str:
    return "const issues = " + json.dumps(issues, indent=2, ensure_ascii=True) + ";\n"


def render_global(issues: list[dict[str, Any]], global_name: str) -> str:
    return f"window.{global_name} = " + json.dumps(issues, indent=2, ensure_ascii=True) + ";\n"


def find_issue_fixture_end(source: str, array_start: int) -> int:
    depth = 0
    string_quote: str | None = None
    escaped = False

    for index in range(array_start, len(source)):
        char = source[index]
        if string_quote:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == string_quote:
                string_quote = None
            continue

        if char in {"'", '"', "`"}:
            string_quote = char
        elif char == "[":
            depth += 1
        elif char == "]":
            depth -= 1
            if depth == 0:
                end = index + 1
                while end < len(source) and source[end].isspace():
                    end += 1
                if end < len(source) and source[end] == ";":
                    end += 1
                return end

    raise ValueError("could not find the end of the const issues array")


def replace_app_fixture(app_js: Path, replacement: str) -> None:
    source = app_js.read_text(encoding="utf-8")
    marker = "const issues ="
    start = source.find(marker)
    if start == -1:
        raise ValueError(f"{app_js}: could not find 'const issues =' fixture")
    array_start = source.find("[", start)
    if array_start == -1:
        raise ValueError(f"{app_js}: could not find issue array after fixture marker")
    end = find_issue_fixture_end(source, array_start)
    app_js.write_text(source[:start] + replacement + source[end:], encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync workpanel JSON state into panel JavaScript data.")
    parser.add_argument("state", type=Path, help="Path to workpanel issue state JSON")
    parser.add_argument("--app-js", type=Path, help="Replace the const issues fixture in an existing app.js")
    parser.add_argument("--out", type=Path, help="Write a standalone window.WORKPANEL_ISSUES data file")
    parser.add_argument("--global-name", default="WORKPANEL_ISSUES", help="Global name for --out")
    args = parser.parse_args()

    try:
        issues = load_issues(args.state)
        if args.app_js:
            replace_app_fixture(args.app_js, render_const(issues))
        if args.out:
            args.out.write_text(render_global(issues, args.global_name), encoding="utf-8")
        if not args.app_js and not args.out:
            sys.stdout.write(render_const(issues))
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"sync failed: {exc}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
