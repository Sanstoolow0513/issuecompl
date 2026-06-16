import { useMemo } from "react";
import { issueDecisionState, issueAcceptance, issueMergeStatus } from "../utils/issueHelpers";

function Metric({ value, label }) {
  return (
    <div className="metric">
      <span className="metric-value">{value}</span>
      <span className="metric-label">{label}</span>
    </div>
  );
}

export default function Topbar({ issues, paused, onTogglePause, onBatchReview }) {
  const metrics = useMemo(() => {
    const agents = new Set(issues.map((i) => i.agent)).size;
    const pendingDecisions = issues
      .flatMap((i) => i.decisions)
      .filter((d) => d.status !== "accepted").length;
    const gates = issues.flatMap((i) => i.acceptance);
    const doneGates = gates.filter((g) => g.done).length;
    const acceptance = gates.length === 0 ? 0 : Math.round((doneGates / gates.length) * 100);
    const mergeReady = issues.filter((i) => issueMergeStatus(i) === "ready").length;
    return { total: issues.length, agents, pendingDecisions, acceptance, mergeReady };
  }, [issues]);

  return (
    <header className="topbar">
      <div className="brand-block">
        <span className="brand-mark" aria-hidden="true">WP</span>
        <div>
          <h1>workpanel</h1>
          <p>Issue resolution control room</p>
        </div>
      </div>

      <section className="metrics" aria-label="run metrics">
        <Metric value={metrics.total} label="Issues" />
        <Metric value={metrics.agents} label="Agents" />
        <Metric value={metrics.pendingDecisions} label="ADR Pending" />
        <Metric value={`${metrics.acceptance}%`} label="Acceptance" />
        <Metric value={metrics.mergeReady} label="Merge Ready" />
      </section>

      <div className="top-actions" aria-label="run actions">
        <button
          className="icon-button"
          type="button"
          title={paused ? "Resume run" : "Pause run"}
          aria-label={paused ? "Resume run" : "Pause run"}
          onClick={onTogglePause}
        >
          {paused ? ">" : "||"}
        </button>
        <button className="command-button" type="button" onClick={onBatchReview}>
          Batch Review
        </button>
      </div>
    </header>
  );
}
