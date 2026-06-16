import { STAGES, formatStatus } from "../utils/issueHelpers";
import DecisionItem from "./DecisionItem";
import AcceptanceList from "./AcceptanceList";
import MergeContract from "./MergeContract";

export default function DecisionGate({
  issue,
  onUpdateDecision,
  onToggleAcceptance,
}) {
  if (!issue) {
    return (
      <aside className="control-panel framed-tool" aria-label="decision and acceptance controls">
        <div className="panel-heading">
          <div>
            <h2>Decision Gate</h2>
            <span>No issue selected</span>
          </div>
          <span className="status-token">-</span>
        </div>
      </aside>
    );
  }

  return (
    <aside className="control-panel framed-tool" aria-label="decision and acceptance controls">
      <div className="panel-heading">
        <div>
          <h2>Decision Gate</h2>
          <span>{issue.owner} / {issue.agent}</span>
        </div>
        <span className={`status-token risk-${issue.risk}`}>{issue.risk}</span>
      </div>

      <section className="detail-section">
        <h3>ADR Ledger</h3>
        <div className="decision-list">
          {issue.decisions.map((d) => (
            <DecisionItem
              key={d.id}
              decision={d}
              onApprove={(id) => onUpdateDecision(issue.id, id, "accepted")}
              onRevise={(id) => onUpdateDecision(issue.id, id, "needs-revision")}
            />
          ))}
        </div>
      </section>

      <section className="detail-section">
        <h3>Acceptance Gates</h3>
        <AcceptanceList
          acceptance={issue.acceptance}
          onToggle={(index, done) => onToggleAcceptance(issue.id, index, done)}
        />
      </section>

      <section className="detail-section merge-summary">
        <h3>Merge Contract</h3>
        <MergeContract issue={issue} />
      </section>
    </aside>
  );
}
