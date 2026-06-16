export default function AcceptanceList({ acceptance, onToggle }) {
  if (!acceptance?.length) return null;

  return (
    <div className="acceptance-list">
      {acceptance.map((gate, index) => (
        <label key={index} className="acceptance-item acceptance-row">
          <input
            className="acceptance-check"
            type="checkbox"
            checked={gate.done}
            onChange={(e) => onToggle(index, e.target.checked)}
          />
          <span>
            <span className="acceptance-title">{gate.label}</span>
            <span className="acceptance-meta">
              {gate.done ? "Evidence attached" : "Evidence missing"}
            </span>
          </span>
        </label>
      ))}
    </div>
  );
}
