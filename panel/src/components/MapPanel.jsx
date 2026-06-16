import { STAGES } from "../utils/issueHelpers";
import ResolutionMap from "./ResolutionMap";
import SignalStrip from "./SignalStrip";

export default function MapPanel({ issue }) {
  const title = issue ? `${issue.id} ${issue.title}` : "Resolution Map";
  const subtitle = issue ? `${issue.product} / ${issue.branch}` : "Select an issue";

  return (
    <section className="map-panel framed-tool" aria-label="decision and acceptance map">
      <div className="panel-heading map-heading">
        <div>
          <h2>{title}</h2>
          <span>{subtitle}</span>
        </div>
        <div className="stage-pills">
          {issue &&
            STAGES.map((stage) => (
              <span
                key={stage}
                className={`stage-pill${stage === issue.stage ? " is-active" : ""}`}
              >
                {stage}
              </span>
            ))}
        </div>
      </div>

      <div className="map-wrap">
        <ResolutionMap issue={issue} />
      </div>

      <SignalStrip signals={issue?.signals} />
    </section>
  );
}
