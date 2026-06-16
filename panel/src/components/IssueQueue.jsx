import { useMemo } from "react";
import { filterIssues, sortIssues } from "../utils/issueHelpers";
import IssueCard from "./IssueCard";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "decision", label: "ADR" },
  { key: "blocked", label: "Blocked" },
  { key: "ready", label: "Ready" },
];

export default function IssueQueue({
  issues,
  selectedId,
  filter,
  sort,
  onSelect,
  onFilterChange,
  onSortChange,
}) {
  const visible = useMemo(
    () => sortIssues(filterIssues(issues, filter), sort),
    [issues, filter, sort]
  );

  return (
    <aside className="queue-panel framed-tool" aria-label="issue queue">
      <div className="panel-heading">
        <div>
          <h2>Issue Queue</h2>
          <span>{visible.length} visible</span>
        </div>
        <select
          aria-label="Sort issues"
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="risk">Risk</option>
          <option value="stage">Stage</option>
          <option value="eta">ETA</option>
        </select>
      </div>

      <div className="segmented-control" role="tablist" aria-label="Issue filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`segment${filter === f.key ? " is-active" : ""}`}
            type="button"
            onClick={() => onFilterChange(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="issue-list">
        {visible.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            isSelected={issue.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </aside>
  );
}
