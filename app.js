const stages = ["Intake", "ADR", "Patch", "Checks", "Review", "Merge"];

const issues = [
  {
    id: "PAY-1842",
    title: "Checkout total drifts after coupon rollback",
    product: "billing-web",
    severity: "high",
    risk: "high",
    stage: "Review",
    agent: "codex-a17",
    branch: "fix/pay-1842-coupon-total",
    owner: "Mina",
    eta: "35m",
    merge: "wait",
    decisions: [
      {
        id: "adr-1842-1",
        title: "Move coupon rollback into pricing reducer",
        context: "State mutation happens in both cart and payment views.",
        decision: "Normalize rollback in the reducer and keep UI as a pure renderer.",
        consequence: "Lower UI drift, requires reducer regression coverage.",
        status: "accepted"
      },
      {
        id: "adr-1842-2",
        title: "Reject view-level patch",
        context: "A view-only fix hides drift in one checkout route.",
        decision: "Do not patch the component total calculation.",
        consequence: "Slightly larger diff, better cross-route behavior.",
        status: "pending"
      }
    ],
    acceptance: [
      { label: "Unit tests cover coupon add, remove, rollback", done: true },
      { label: "E2E verifies checkout and confirmation totals", done: true },
      { label: "Diff contains no payment gateway contract change", done: false },
      { label: "Reviewer confirms ADR-1842-2", done: false }
    ],
    signals: {
      tests: "34/35",
      diff: "+86 -41",
      review: "1 wait",
      rollback: "low"
    }
  },
  {
    id: "AUTH-339",
    title: "Session refresh loop on expired SSO token",
    product: "identity",
    severity: "medium",
    risk: "medium",
    stage: "Checks",
    agent: "claude-b03",
    branch: "fix/auth-339-refresh-loop",
    owner: "Jun",
    eta: "50m",
    merge: "hold",
    decisions: [
      {
        id: "adr-339-1",
        title: "Single-flight refresh guard",
        context: "Multiple tabs call refresh after the same token expiry.",
        decision: "Gate refresh with a single-flight promise keyed by tenant.",
        consequence: "Prevents retry storms, needs tenant isolation tests.",
        status: "needs-revision"
      },
      {
        id: "adr-339-2",
        title: "No silent logout on first refresh failure",
        context: "Network jitter currently pushes users to login.",
        decision: "Retry once with jitter and then show re-auth state.",
        consequence: "Better UX, one extra auth branch.",
        status: "pending"
      }
    ],
    acceptance: [
      { label: "Tenant isolation unit tests pass", done: false },
      { label: "Browser multi-tab regression passes", done: false },
      { label: "Auth telemetry does not log raw token data", done: true },
      { label: "Security reviewer signs off", done: false }
    ],
    signals: {
      tests: "21/29",
      diff: "+144 -66",
      review: "blocked",
      rollback: "medium"
    }
  },
  {
    id: "OPS-771",
    title: "Incident banner stays visible after resolution",
    product: "status-admin",
    severity: "low",
    risk: "low",
    stage: "Merge",
    agent: "cursor-c21",
    branch: "fix/ops-771-banner-cache",
    owner: "Ari",
    eta: "ready",
    merge: "pass",
    decisions: [
      {
        id: "adr-771-1",
        title: "Invalidate cache from incident state transition",
        context: "Banner cache is refreshed by polling only.",
        decision: "Emit invalidation when incidents move to resolved.",
        consequence: "Faster UI consistency, one new event path.",
        status: "accepted"
      }
    ],
    acceptance: [
      { label: "State transition test covers resolved incidents", done: true },
      { label: "Manual screenshot captured for active and resolved states", done: true },
      { label: "No cache key change for public status pages", done: true },
      { label: "Merge conflict check is clean", done: true }
    ],
    signals: {
      tests: "18/18",
      diff: "+42 -12",
      review: "approved",
      rollback: "low"
    }
  },
  {
    id: "CRM-512",
    title: "Bulk import accepts duplicate external ids",
    product: "crm-api",
    severity: "high",
    risk: "high",
    stage: "ADR",
    agent: "opencode-d09",
    branch: "fix/crm-512-import-dedupe",
    owner: "Nora",
    eta: "90m",
    merge: "hold",
    decisions: [
      {
        id: "adr-512-1",
        title: "Reject duplicates before persistence",
        context: "Current import dedupe happens after partial writes.",
        decision: "Validate external ids in a preflight import plan.",
        consequence: "No partial duplicate writes, higher memory use for large files.",
        status: "pending"
      },
      {
        id: "adr-512-2",
        title: "Keep existing upsert semantics",
        context: "Customers depend on update by external id.",
        decision: "Only reject duplicates inside the same uploaded file.",
        consequence: "Avoids breaking integrations, needs fixture coverage.",
        status: "pending"
      }
    ],
    acceptance: [
      { label: "Fixture with duplicate rows fails before write", done: false },
      { label: "Existing upsert integration remains green", done: true },
      { label: "Import error includes row-level evidence", done: false },
      { label: "Migration impact documented", done: false }
    ],
    signals: {
      tests: "12/24",
      diff: "+201 -38",
      review: "not started",
      rollback: "high"
    }
  },
  {
    id: "UI-908",
    title: "Kanban swimlane count is stale after drag",
    product: "project-ui",
    severity: "medium",
    risk: "medium",
    stage: "Patch",
    agent: "pi-e14",
    branch: "fix/ui-908-swimlane-count",
    owner: "Tao",
    eta: "25m",
    merge: "wait",
    decisions: [
      {
        id: "adr-908-1",
        title: "Recompute lane counts from normalized board state",
        context: "Drag operations update cards before lane counters.",
        decision: "Derive counts from normalized state selectors.",
        consequence: "Removes manual counter sync, changes selector cache boundary.",
        status: "accepted"
      }
    ],
    acceptance: [
      { label: "Drag between lanes updates both counts", done: true },
      { label: "Undo drag restores source and target counts", done: false },
      { label: "Selector memoization benchmark remains stable", done: false },
      { label: "Visual regression is reviewed", done: false }
    ],
    signals: {
      tests: "9/14",
      diff: "+73 -58",
      review: "queued",
      rollback: "low"
    }
  },
  {
    id: "DATA-267",
    title: "Report export drops timezone on scheduled jobs",
    product: "analytics",
    severity: "medium",
    risk: "low",
    stage: "Merge",
    agent: "codex-a22",
    branch: "fix/data-267-export-timezone",
    owner: "Ivy",
    eta: "ready",
    merge: "pass",
    decisions: [
      {
        id: "adr-267-1",
        title: "Store schedule timezone with export manifest",
        context: "Job execution stores UTC time but not the user's timezone.",
        decision: "Persist timezone in the export manifest and hydrate CSV metadata.",
        consequence: "Stable scheduled exports, backward-compatible manifest parser.",
        status: "accepted"
      }
    ],
    acceptance: [
      { label: "Backfill path supports old manifests", done: true },
      { label: "CSV metadata includes original timezone", done: true },
      { label: "Scheduler regression passes for DST boundary", done: true },
      { label: "Customer support note is attached", done: true }
    ],
    signals: {
      tests: "27/27",
      diff: "+64 -20",
      review: "approved",
      rollback: "low"
    }
  }
];

const state = {
  selectedId: issues[0].id,
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
  return issues.find((issue) => issue.id === state.selectedId) ?? issues[0];
}

function issueAcceptance(issue) {
  const total = issue.acceptance.length;
  const done = issue.acceptance.filter((item) => item.done).length;
  return Math.round((done / total) * 100);
}

function issueDecisionState(issue) {
  if (issue.decisions.some((decision) => decision.status === "needs-revision")) {
    return "needs-revision";
  }
  if (issue.decisions.some((decision) => decision.status === "pending")) {
    return "pending";
  }
  return "accepted";
}

function issueMergeStatus(issue) {
  if (issue.merge === "pass") return "ready";
  if (issue.merge === "hold") return "hold";
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
  const acceptance = Math.round((acceptedItems / acceptanceItems.length) * 100);
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
