export const STAGES = ["Intake", "ADR", "Patch", "Checks", "Review", "Merge"];

const RISK_WEIGHT = { high: 3, medium: 2, low: 1 };
const STAGE_WEIGHT = Object.fromEntries(STAGES.map((s, i) => [s, i]));

export function issueAcceptance(issue) {
  const total = issue?.acceptance?.length ?? 0;
  if (total === 0) return 0;
  const done = issue.acceptance.filter((g) => g.done).length;
  return Math.round((done / total) * 100);
}

export function issueDecisionState(issue) {
  const decisions = issue?.decisions ?? [];
  if (decisions.some((d) => d.status === "needs-revision")) return "needs-revision";
  if (decisions.some((d) => d.status === "pending")) return "pending";
  return "accepted";
}

export function issueMergeStatus(issue) {
  if (issue?.merge === "pass") return "ready";
  if (issue?.merge === "hold") return "hold";
  return "wait";
}

export function computeMerge(issue) {
  return issueDecisionState(issue) === "accepted" && issueAcceptance(issue) === 100
    ? "pass"
    : issue.merge === "pass"
      ? "wait"
      : issue.merge;
}

export function formatStatus(value) {
  return value
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function etaValue(v) {
  if (v === "ready") return 0;
  return Number.parseInt(v, 10) || 999;
}

export function filterIssues(issues, filter) {
  return issues.filter((issue) => {
    if (filter === "decision") return issueDecisionState(issue) !== "accepted";
    if (filter === "blocked") return issueMergeStatus(issue) === "hold";
    if (filter === "ready") return issueMergeStatus(issue) === "ready";
    return true;
  });
}

export function sortIssues(issues, sort) {
  return [...issues].sort((a, b) => {
    if (sort === "stage") return STAGE_WEIGHT[a.stage] - STAGE_WEIGHT[b.stage];
    if (sort === "eta") return etaValue(a.eta) - etaValue(b.eta);
    return RISK_WEIGHT[b.risk] - RISK_WEIGHT[a.risk];
  });
}

export function stageIndex(stage) {
  return STAGE_WEIGHT[stage] ?? -1;
}
