const stages = ["Intake", "ADR", "Patch", "Checks", "Review", "Merge"];

const panelIssues = Array.isArray(globalThis.WORKPANEL_ISSUES)
  ? globalThis.WORKPANEL_ISSUES
  : [];

const issues = panelIssues.map((issue) => ({
  ...issue,
  decisions: Array.isArray(issue.decisions) ? issue.decisions : [],
  acceptance: Array.isArray(issue.acceptance) ? issue.acceptance : [],
  signals: issue.signals ?? {}
}));

const state = {
  selectedId: issues[0]?.id ?? "",
  filter: "all",
  sort: "risk",
  paused: false
};

const riskWeight = { high: 3, medium: 2, low: 1 };
const stageWeight = Object.fromEntries(stages.map((stage, index) => [stage, index]));

const elements = {
  issueList: document.querySelector("#issueList"),
  queueCount: document.querySelector("#queueCount"),
  sortMode: document.querySelector("#sortMode"),
  selectedTitle: document.querySelector("#selectedTitle"),
  selectedSubtitle: document.querySelector("#selectedSubtitle"),
  stagePills: document.querySelector("#stagePills"),
  resolutionMap: document.querySelector("#resolutionMap"),
  signalStrip: document.querySelector("#signalStrip"),
  decisionList: document.querySelector("#decisionList"),
  acceptanceList: document.querySelector("#acceptanceList"),
  detailOwner: document.querySelector("#detailOwner"),
  detailRisk: document.querySelector("#detailRisk"),
  mergeContract: document.querySelector("#mergeContract"),
  mergeTrain: document.querySelector("#mergeTrain"),
  pauseRun: document.querySelector("#pauseRun"),
  batchReview: document.querySelector("#batchReview"),
  metricIssues: document.querySelector("#metricIssues"),
  metricAgents: document.querySelector("#metricAgents"),
  metricDecisions: document.querySelector("#metricDecisions"),
  metricAcceptance: document.querySelector("#metricAcceptance"),
  metricMergeReady: document.querySelector("#metricMergeReady")
};

function selectedIssue() {
  return issues.find((issue) => issue.id === state.selectedId) ?? issues[0] ?? null;
}

function issueAcceptance(issue) {
  const total = issue?.acceptance.length ?? 0;
  if (total === 0) return 0;
  const done = issue.acceptance.filter((item) => item.done).length;
  return Math.round((done / total) * 100);
}

function issueDecisionState(issue) {
  const decisions = issue?.decisions ?? [];
  if (decisions.some((decision) => decision.status === "needs-revision")) {
    return "needs-revision";
  }
  if (decisions.some((decision) => decision.status === "pending")) {
    return "pending";
  }
  return "accepted";
}

function issueMergeStatus(issue) {
  if (issue?.merge === "pass") return "ready";
  if (issue?.merge === "hold") return "hold";
  return "wait";
}

function visibleIssues() {
  const filtered = issues.filter((issue) => {
    if (state.filter === "decision") return issueDecisionState(issue) !== "accepted";
    if (state.filter === "blocked") return issueMergeStatus(issue) === "hold";
    if (state.filter === "ready") return issueMergeStatus(issue) === "ready";
    return true;
  });

  return filtered.sort((a, b) => {
    if (state.sort === "stage") return stageWeight[a.stage] - stageWeight[b.stage];
    if (state.sort === "eta") return etaValue(a.eta) - etaValue(b.eta);
    return riskWeight[b.risk] - riskWeight[a.risk];
  });
}

function etaValue(value) {
  if (value === "ready") return 0;
  return Number.parseInt(value, 10) || 999;
}

function renderMetrics() {
  const agents = new Set(issues.map((issue) => issue.agent)).size;
  const pendingDecisions = issues
    .flatMap((issue) => issue.decisions)
    .filter((decision) => decision.status !== "accepted").length;
  const acceptanceItems = issues.flatMap((issue) => issue.acceptance);
  const acceptedItems = acceptanceItems.filter((item) => item.done).length;
  const acceptance = acceptanceItems.length === 0 ? 0 : Math.round((acceptedItems / acceptanceItems.length) * 100);
  const mergeReady = issues.filter((issue) => issueMergeStatus(issue) === "ready").length;

  elements.metricIssues.textContent = String(issues.length);
  elements.metricAgents.textContent = String(agents);
  elements.metricDecisions.textContent = String(pendingDecisions);
  elements.metricAcceptance.textContent = `${acceptance}%`;
  elements.metricMergeReady.textContent = String(mergeReady);
}

function renderIssueList() {
  const list = visibleIssues();
  elements.queueCount.textContent = `${list.length} visible`;
  elements.issueList.replaceChildren(
    ...list.map((issue) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = `issue-card${issue.id === state.selectedId ? " is-selected" : ""}`;
      card.addEventListener("click", () => {
        state.selectedId = issue.id;
        render();
      });

      const decisionState = issueDecisionState(issue);
      const acceptance = issueAcceptance(issue);
      card.innerHTML = `
        <div class="issue-topline">
          <span class="issue-id">${escapeHtml(issue.id)}</span>
          <span class="risk-token risk-${issue.risk}">${escapeHtml(issue.risk)}</span>
        </div>
        <div class="issue-title">${escapeHtml(issue.title)}</div>
        <div class="issue-meta">
          <span>${escapeHtml(issue.product)}</span>
          <span>${escapeHtml(issue.agent)}</span>
          <span>${escapeHtml(issue.stage)}</span>
        </div>
        <div class="issue-bottomline">
          <span class="stage-token status-${decisionState}">ADR ${formatStatus(decisionState)}</span>
          <span class="stage-token status-${issueMergeStatus(issue)}">${acceptance}%</span>
        </div>
      `;
      return card;
    })
  );
}

function renderDetail() {
  const issue = selectedIssue();
  if (!issue) {
    elements.selectedTitle.textContent = "No issues";
    elements.selectedSubtitle.textContent = "Sync workpanel/issues.json";
    elements.detailOwner.textContent = "No issue selected";
    elements.detailRisk.textContent = "-";
    elements.detailRisk.className = "status-token";
    elements.stagePills.replaceChildren();
    elements.decisionList.replaceChildren();
    elements.acceptanceList.replaceChildren();
    elements.mergeContract.replaceChildren();
    elements.signalStrip.replaceChildren();
    elements.resolutionMap.replaceChildren();
    return;
  }

  elements.selectedTitle.textContent = `${issue.id} ${issue.title}`;
  elements.selectedSubtitle.textContent = `${issue.product} / ${issue.branch}`;
  elements.detailOwner.textContent = `${issue.owner} / ${issue.agent}`;
  elements.detailRisk.textContent = issue.risk;
  elements.detailRisk.className = `status-token risk-${issue.risk}`;

  elements.stagePills.replaceChildren(
    ...stages.map((stage) => {
      const pill = document.createElement("span");
      pill.className = `stage-pill${stage === issue.stage ? " is-active" : ""}`;
      pill.textContent = stage;
      return pill;
    })
  );

  renderDecisionList(issue);
  renderAcceptanceList(issue);
  renderMergeContract(issue);
  renderSignals(issue);
  renderMap(issue);
}

function renderDecisionList(issue) {
  elements.decisionList.replaceChildren(
    ...issue.decisions.map((decision) => {
      const item = document.createElement("article");
      item.className = "decision-item";
      item.innerHTML = `
        <div class="issue-bottomline">
          <span class="decision-title">${escapeHtml(decision.title)}</span>
          <span class="status-token status-${decision.status}">${formatStatus(decision.status)}</span>
        </div>
        <div class="decision-meta">Context: ${escapeHtml(decision.context)}</div>
        <div class="decision-meta">Decision: ${escapeHtml(decision.decision)}</div>
        <div class="decision-meta">Consequence: ${escapeHtml(decision.consequence)}</div>
        <div class="decision-actions">
          <button class="small-action primary" data-decision-action="accepted" data-decision-id="${decision.id}" type="button">Approve</button>
          <button class="small-action" data-decision-action="needs-revision" data-decision-id="${decision.id}" type="button">Revise</button>
        </div>
      `;
      return item;
    })
  );
}

function renderAcceptanceList(issue) {
  elements.acceptanceList.replaceChildren(
    ...issue.acceptance.map((gate, index) => {
      const item = document.createElement("label");
      item.className = "acceptance-item acceptance-row";
      item.innerHTML = `
        <input class="acceptance-check" data-acceptance-index="${index}" type="checkbox" ${gate.done ? "checked" : ""} />
        <span>
          <span class="acceptance-title">${escapeHtml(gate.label)}</span>
          <span class="acceptance-meta">${gate.done ? "Evidence attached" : "Evidence missing"}</span>
        </span>
      `;
      return item;
    })
  );
}

function renderMergeContract(issue) {
  const rows = [
    ["Branch", issue.branch],
    ["Decision", formatStatus(issueDecisionState(issue))],
    ["Acceptance", `${issueAcceptance(issue)}%`],
    ["Merge", formatStatus(issueMergeStatus(issue))]
  ];

  elements.mergeContract.replaceChildren(
    ...rows.map(([term, value]) => {
      const row = document.createElement("div");
      row.className = "contract-row";
      row.innerHTML = `<dt>${escapeHtml(term)}</dt><dd>${escapeHtml(value)}</dd>`;
      return row;
    })
  );
}

function renderSignals(issue) {
  const cards = [
    ["Tests", issue.signals.tests],
    ["Diff", issue.signals.diff],
    ["Review", issue.signals.review],
    ["Rollback", issue.signals.rollback]
  ];

  elements.signalStrip.replaceChildren(
    ...cards.map(([label, value]) => {
      const card = document.createElement("article");
      card.className = "signal-card";
      card.innerHTML = `<span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>`;
      return card;
    })
  );
}

function renderMap(issue) {
  const currentIndex = stageWeight[issue.stage];
  const acceptance = issueAcceptance(issue);
  const decisionState = issueDecisionState(issue);
  const blocked = decisionState === "needs-revision" || issueMergeStatus(issue) === "hold";
  const nodes = [
    { stage: "Intake", x: 95, y: 188, sub: issue.id },
    { stage: "ADR", x: 240, y: 132, sub: formatStatus(decisionState) },
    { stage: "Patch", x: 390, y: 205, sub: issue.agent },
    { stage: "Checks", x: 545, y: 132, sub: issue.signals.tests },
    { stage: "Review", x: 695, y: 205, sub: issue.signals.review },
    { stage: "Merge", x: 840, y: 152, sub: `${acceptance}% gates` }
  ];

  const links = nodes.slice(0, -1).map((node, index) => {
    const next = nodes[index + 1];
    const active = index < currentIndex;
    const blockedLink = blocked && index >= Math.max(currentIndex - 1, 0);
    return `<path class="map-link ${active ? "is-active" : ""} ${blockedLink ? "is-blocked" : ""}" d="M ${node.x + 54} ${node.y} C ${node.x + 82} ${node.y}, ${next.x - 82} ${next.y}, ${next.x - 54} ${next.y}" />`;
  });

  const nodeMarkup = nodes.map((node, index) => {
    const stageStatus = index < currentIndex ? "is-complete" : node.stage === issue.stage ? "is-active" : "";
    const blockedNode = blocked && node.stage === issue.stage ? "is-blocked" : "";
    return `
      <g>
        <rect class="map-node ${stageStatus} ${blockedNode}" x="${node.x - 58}" y="${node.y - 34}" width="116" height="68" rx="8" />
        <text class="map-label" x="${node.x}" y="${node.y - 3}">${escapeHtml(node.stage)}</text>
        <text class="map-sub" x="${node.x}" y="${node.y + 18}">${escapeHtml(node.sub)}</text>
      </g>
    `;
  });

  const laneMarkup = `
    <path class="agent-lane lane-1" d="M 95 305 C 210 255, 330 328, 460 280 S 700 255, 840 304" />
    <path class="agent-lane lane-2" d="M 95 335 C 255 360, 360 310, 500 338 S 720 364, 840 330" />
    <path class="agent-lane lane-3" d="M 95 60 C 230 45, 350 78, 470 55 S 700 42, 840 70" />
    <text class="map-sub" x="95" y="30">parallel agents</text>
    <text class="map-sub" x="840" y="365">merge arbitration</text>
  `;

  elements.resolutionMap.innerHTML = `
    <rect x="1" y="1" width="918" height="388" fill="transparent" />
    ${laneMarkup}
    ${links.join("")}
    ${nodeMarkup.join("")}
  `;
}

function renderMergeTrain() {
  const columns = stages.slice(1).map((stage) => {
    const column = document.createElement("section");
    column.className = "train-column";
    const matching = issues.filter((issue) => issue.stage === stage);
    const cards = matching
      .map((issue) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = `train-card ${issue.merge}`;
        card.addEventListener("click", () => {
          state.selectedId = issue.id;
          render();
        });
        card.innerHTML = `
          <strong>${escapeHtml(issue.id)}</strong>
          <span>${escapeHtml(issue.title)}</span>
          <span>${issueAcceptance(issue)}% / ${formatStatus(issueMergeStatus(issue))}</span>
        `;
        return card;
      });

    const heading = document.createElement("h3");
    heading.textContent = stage;
    column.append(heading, ...cards);
    return column;
  });

  elements.mergeTrain.replaceChildren(...columns);
}

function wireEvents() {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
      render();
    });
  });

  elements.sortMode.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderIssueList();
  });

  elements.decisionList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-decision-action]");
    if (!button) return;
    const issue = selectedIssue();
    if (!issue) return;
    const decision = issue.decisions.find((item) => item.id === button.dataset.decisionId);
    if (!decision) return;
    decision.status = button.dataset.decisionAction;
    issue.merge = issueDecisionState(issue) === "accepted" && issueAcceptance(issue) === 100 ? "pass" : "wait";
    render();
  });

  elements.acceptanceList.addEventListener("change", (event) => {
    const input = event.target.closest("[data-acceptance-index]");
    if (!input) return;
    const issue = selectedIssue();
    if (!issue) return;
    issue.acceptance[Number(input.dataset.acceptanceIndex)].done = input.checked;
    issue.merge = issueDecisionState(issue) === "accepted" && issueAcceptance(issue) === 100 ? "pass" : "wait";
    render();
  });

  elements.pauseRun.addEventListener("click", () => {
    state.paused = !state.paused;
    document.body.classList.toggle("is-paused", state.paused);
    elements.pauseRun.textContent = state.paused ? ">" : "||";
    elements.pauseRun.title = state.paused ? "Resume run" : "Pause run";
    elements.pauseRun.setAttribute("aria-label", state.paused ? "Resume run" : "Pause run");
  });

  elements.batchReview.addEventListener("click", () => {
    issues.forEach((issue) => {
      if (issueDecisionState(issue) === "pending" && issueAcceptance(issue) >= 75) {
        issue.decisions.forEach((decision) => {
          if (decision.status === "pending") decision.status = "accepted";
        });
      }
      issue.merge = issueDecisionState(issue) === "accepted" && issueAcceptance(issue) === 100 ? "pass" : issue.merge;
    });
    render();
  });
}

function render() {
  renderMetrics();
  renderIssueList();
  renderDetail();
  renderMergeTrain();
}

function formatStatus(value) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

wireEvents();
render();
