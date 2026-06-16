import { useMemo } from "react";
import {
  STAGES,
  stageIndex,
  issueDecisionState,
  issueAcceptance,
  issueMergeStatus,
  formatStatus,
} from "../utils/issueHelpers";

export default function ResolutionMap({ issue }) {
  const { nodes, links, laneMarkup } = useMemo(() => {
    if (!issue) return { nodes: [], links: [], laneMarkup: null };

    const currentIdx = stageIndex(issue.stage);
    const acceptance = issueAcceptance(issue);
    const decisionState = issueDecisionState(issue);
    const blocked =
      decisionState === "needs-revision" || issueMergeStatus(issue) === "hold";

    const nodeData = [
      { stage: "Intake", x: 95, y: 188, sub: issue.id },
      { stage: "ADR", x: 240, y: 132, sub: formatStatus(decisionState) },
      { stage: "Patch", x: 390, y: 205, sub: issue.agent },
      { stage: "Checks", x: 545, y: 132, sub: issue.signals.tests },
      { stage: "Review", x: 695, y: 205, sub: issue.signals.review },
      { stage: "Merge", x: 840, y: 152, sub: `${acceptance}% gates` },
    ];

    const linkData = nodeData.slice(0, -1).map((node, i) => {
      const next = nodeData[i + 1];
      const active = i < currentIdx;
      const blockedLink = blocked && i >= Math.max(currentIdx - 1, 0);
      return {
        key: `${node.stage}-${next.stage}`,
        d: `M ${node.x + 54} ${node.y} C ${node.x + 82} ${node.y}, ${next.x - 82} ${next.y}, ${next.x - 54} ${next.y}`,
        active,
        blocked: blockedLink,
      };
    });

    const enrichedNodes = nodeData.map((node, i) => ({
      ...node,
      complete: i < currentIdx,
      active: node.stage === issue.stage,
      blocked: blocked && node.stage === issue.stage,
    }));

    return { nodes: enrichedNodes, links: linkData, laneMarkup: true };
  }, [issue]);

  if (!issue) return null;

  return (
    <svg viewBox="0 0 920 390" role="img" aria-label="Issue resolution graph">
      <rect x="1" y="1" width="918" height="388" fill="transparent" />

      <path className="agent-lane lane-1" d="M 95 305 C 210 255, 330 328, 460 280 S 700 255, 840 304" />
      <path className="agent-lane lane-2" d="M 95 335 C 255 360, 360 310, 500 338 S 720 364, 840 330" />
      <path className="agent-lane lane-3" d="M 95 60 C 230 45, 350 78, 470 55 S 700 42, 840 70" />
      <text className="map-sub" x="95" y="30">parallel agents</text>
      <text className="map-sub" x="840" y="365">merge arbitration</text>

      {links.map((link) => (
        <path
          key={link.key}
          className={`map-link${link.active ? " is-active" : ""}${link.blocked ? " is-blocked" : ""}`}
          d={link.d}
        />
      ))}

      {nodes.map((node) => {
        const cls = node.complete
          ? "is-complete"
          : node.active
            ? "is-active"
            : "";
        const blockedCls = node.blocked ? " is-blocked" : "";
        return (
          <g key={node.stage}>
            <rect
              className={`map-node ${cls}${blockedCls}`}
              x={node.x - 58}
              y={node.y - 34}
              width={116}
              height={68}
              rx={8}
            />
            <text className="map-label" x={node.x} y={node.y - 3}>
              {node.stage}
            </text>
            <text className="map-sub" x={node.x} y={node.y + 18}>
              {node.sub}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
