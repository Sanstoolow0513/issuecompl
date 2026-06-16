export default function SignalStrip({ signals }) {
  if (!signals) return null;

  const cards = [
    ["Tests", signals.tests],
    ["Diff", signals.diff],
    ["Review", signals.review],
    ["Rollback", signals.rollback],
  ];

  return (
    <div className="signal-strip">
      {cards.map(([label, value]) => (
        <article key={label} className="signal-card">
          <span>{label}</span>
          <strong>{value}</strong>
        </article>
      ))}
    </div>
  );
}
