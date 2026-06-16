import { useIssues } from "./hooks/useIssues";
import Topbar from "./components/Topbar";
import IssueQueue from "./components/IssueQueue";
import MapPanel from "./components/MapPanel";
import DecisionGate from "./components/DecisionGate";
import MergeTrain from "./components/MergeTrain";
import issuesData from "../../workpanel/issues.json";

const rawIssues = issuesData.issues ?? issuesData;

export default function App() {
  const {
    issues,
    selectedId,
    selected,
    filter,
    sort,
    paused,
    select,
    setFilter,
    setSort,
    togglePause,
    updateDecision,
    toggleAcceptance,
    batchReview,
  } = useIssues(rawIssues);

  return (
    <main className={`app-shell${paused ? " is-paused" : ""}`}>
      <Topbar
        issues={issues}
        paused={paused}
        onTogglePause={togglePause}
        onBatchReview={batchReview}
      />

      <section className="workspace">
        <IssueQueue
          issues={issues}
          selectedId={selectedId}
          filter={filter}
          sort={sort}
          onSelect={select}
          onFilterChange={setFilter}
          onSortChange={setSort}
        />

        <MapPanel issue={selected} />

        <DecisionGate
          issue={selected}
          onUpdateDecision={updateDecision}
          onToggleAcceptance={toggleAcceptance}
        />
      </section>

      <MergeTrain issues={issues} onSelect={select} />
    </main>
  );
}
