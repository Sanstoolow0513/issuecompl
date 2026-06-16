import { issueDecisionState, issueAcceptance, issueMergeStatus, formatStatus } from "../utils/issueHelpers";

export default function IssueCard({ issue, isSelected, onSelect }) {
  const decisionState = issueDecisionState(issue);
  const acceptance = issueAcceptance(issue);
  const mergeStatus = issueMergeStatus(issue);

  return (
    <button
      type="button"
      className={`issue-card${isSelected ? " is-selected" : ""}`}
      onClick={() => onSelect(issue.id)}
    >
      <div className="issue-topline">
        <span className="issue-id">{issue.id}</span>
        <span className={`risk-token risk-${issue.risk}`}>{issue.risk}</span>
      </div>
      <div className="issue-title">{issue.title}</div>
      <div className="issue-meta">
        <span>{issue.product}</span>
        <span>{issue.agent}</span>
        <span>{issue.stage}</span>
      </div>
      <div className="issue-bottomline">
        <span className={`stage-token status-${decisionState}`}>
          ADR {formatStatus(decisionState)}
        </span>
        <span className={`stage-token status-${mergeStatus}`}>
          {acceptance}%
        </span>
      </div>
    </button>
  );
}
