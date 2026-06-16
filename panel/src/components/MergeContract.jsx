import { issueDecisionState, issueAcceptance, issueMergeStatus, formatStatus } from "../utils/issueHelpers";

export default function MergeContract({ issue }) {
  if (!issue) return null;

  const rows = [
    ["Branch", issue.branch],
    ["Decision", formatStatus(issueDecisionState(issue))],
    ["Acceptance", `${issueAcceptance(issue)}%`],
    ["Merge", formatStatus(issueMergeStatus(issue))],
  ];

  return (
    <dl>
      {rows.map(([term, value]) => (
        <div key={term} className="contract-row">
          <dt>{term}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
