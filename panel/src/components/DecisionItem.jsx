import { formatStatus } from "../utils/issueHelpers";

export default function DecisionItem({ decision, onApprove, onRevise }) {
  return (
    <article className="decision-item">
      <div className="issue-bottomline">
        <span className="decision-title">{decision.title}</span>
        <span className={`status-token status-${decision.status}`}>
          {formatStatus(decision.status)}
        </span>
      </div>
      <div className="decision-meta">Context: {decision.context}</div>
      <div className="decision-meta">Decision: {decision.decision}</div>
      <div className="decision-meta">Consequence: {decision.consequence}</div>
      <div className="decision-actions">
        <button
          className="small-action primary"
          type="button"
          onClick={() => onApprove(decision.id)}
        >
          Approve
        </button>
        <button
          className="small-action"
          type="button"
          onClick={() => onRevise(decision.id)}
        >
          Revise
        </button>
      </div>
    </article>
  );
}
