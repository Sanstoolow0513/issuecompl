import { useReducer, useCallback } from "react";
import { issueDecisionState, issueAcceptance } from "../utils/issueHelpers";

function normalizeIssue(raw) {
  return {
    ...raw,
    decisions: Array.isArray(raw.decisions) ? raw.decisions : [],
    acceptance: Array.isArray(raw.acceptance) ? raw.acceptance : [],
    signals: raw.signals ?? {},
  };
}

function recalcMerge(issue) {
  return issueDecisionState(issue) === "accepted" && issueAcceptance(issue) === 100
    ? "pass"
    : issue.merge === "pass"
      ? "wait"
      : issue.merge;
}

function reducer(state, action) {
  switch (action.type) {
    case "SELECT":
      return { ...state, selectedId: action.id };

    case "SET_FILTER":
      return { ...state, filter: action.filter };

    case "SET_SORT":
      return { ...state, sort: action.sort };

    case "TOGGLE_PAUSE":
      return { ...state, paused: !state.paused };

    case "UPDATE_DECISION": {
      const issues = state.issues.map((issue) => {
        if (issue.id !== action.issueId) return issue;
        const decisions = issue.decisions.map((d) =>
          d.id === action.decisionId ? { ...d, status: action.status } : d
        );
        const updated = { ...issue, decisions };
        return { ...updated, merge: recalcMerge(updated) };
      });
      return { ...state, issues };
    }

    case "TOGGLE_ACCEPTANCE": {
      const issues = state.issues.map((issue) => {
        if (issue.id !== action.issueId) return issue;
        const acceptance = issue.acceptance.map((g, i) =>
          i === action.index ? { ...g, done: action.done } : g
        );
        const updated = { ...issue, acceptance };
        return { ...updated, merge: recalcMerge(updated) };
      });
      return { ...state, issues };
    }

    case "BATCH_REVIEW": {
      const issues = state.issues.map((issue) => {
        if (issueDecisionState(issue) !== "pending" || issueAcceptance(issue) < 75)
          return issue;
        const decisions = issue.decisions.map((d) =>
          d.status === "pending" ? { ...d, status: "accepted" } : d
        );
        const updated = { ...issue, decisions };
        return { ...updated, merge: recalcMerge(updated) };
      });
      return { ...state, issues };
    }

    default:
      return state;
  }
}

export function useIssues(rawIssues) {
  const normalized = rawIssues.map(normalizeIssue);
  const [state, dispatch] = useReducer(reducer, {
    issues: normalized,
    selectedId: normalized[0]?.id ?? "",
    filter: "all",
    sort: "risk",
    paused: false,
  });

  const selected = state.issues.find((i) => i.id === state.selectedId) ?? state.issues[0] ?? null;

  const select = useCallback((id) => dispatch({ type: "SELECT", id }), []);
  const setFilter = useCallback((filter) => dispatch({ type: "SET_FILTER", filter }), []);
  const setSort = useCallback((sort) => dispatch({ type: "SET_SORT", sort }), []);
  const togglePause = useCallback(() => dispatch({ type: "TOGGLE_PAUSE" }), []);
  const updateDecision = useCallback(
    (issueId, decisionId, status) =>
      dispatch({ type: "UPDATE_DECISION", issueId, decisionId, status }),
    []
  );
  const toggleAcceptance = useCallback(
    (issueId, index, done) =>
      dispatch({ type: "TOGGLE_ACCEPTANCE", issueId, index, done }),
    []
  );
  const batchReview = useCallback(() => dispatch({ type: "BATCH_REVIEW" }), []);

  return {
    ...state,
    selected,
    select,
    setFilter,
    setSort,
    togglePause,
    updateDecision,
    toggleAcceptance,
    batchReview,
  };
}
