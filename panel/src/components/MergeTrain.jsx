import { STAGES, issueAcceptance, issueMergeStatus, formatStatus } from "../utils/issueHelpers";

export default function MergeTrain({ issues, onSelect }) {
  const columns = STAGES.slice(1);

  return (
    <section className="merge-panel framed-tool" aria-label="merge train">
      <div className="panel-heading">
        <div>
          <h2>Merge Train</h2>
          <span>Parallel issue resolution</span>
        </div>
        <div className="train-key" aria-label="merge status key">
          <span><i className="key-dot pass" />Pass</span>
          <span><i className="key-dot wait" />Wait</span>
          <span><i className="key-dot hold" />Hold</span>
        </div>
      </div>

      <div className="train-grid">
        {columns.map((stage) => {
          const matching = issues.filter((i) => i.stage === stage);
          return (
            <section key={stage} className="train-column">
              <h3>{stage}</h3>
              {matching.map((issue) => (
                <button
                  key={issue.id}
                  type="button"
                  className={`train-card ${issue.merge}`}
                  onClick={() => onSelect(issue.id)}
                >
                  <strong>{issue.id}</strong>
                  <span>{issue.title}</span>
                  <span>
                    {issueAcceptance(issue)}% / {formatStatus(issueMergeStatus(issue))}
                  </span>
                </button>
              ))}
            </section>
          );
        })}
      </div>
    </section>
  );
}
