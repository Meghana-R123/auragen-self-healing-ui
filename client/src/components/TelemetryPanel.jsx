export default function TelemetryPanel({ signals, score, serverUpdate, connected, onReset }) {
  const level = score >= 70 ? "High friction" : score >= 40 ? "Moderate friction" : "Low friction";
  return (
    <aside className="panel telemetry-panel">
      <div className="panel-heading">
        <div><p className="eyebrow">LIVE TELEMETRY</p><h2>Friction monitor</h2></div>
        <span className={`connection ${connected ? "online" : "offline"}`}>{connected ? "Connected" : "Connecting"}</span>
      </div>
      <div className="score-row">
        <div><span className="muted">Cognitive friction score</span><div className="score">{score}<small>/100</small></div></div>
        <span className={`level ${score >= 70 ? "high" : score >= 40 ? "medium" : "low"}`}>{level}</span>
      </div>
      <div className="progress-track"><div className={`progress-fill ${score >= 70 ? "high" : score >= 40 ? "medium" : ""}`} style={{ width: `${score}%` }} /></div>
      <div className="signal-list">
        <div><span>Repeated clicks</span><strong>{signals.rageClicks}</strong></div>
        <div><span>Field hesitation</span><strong>{signals.hesitationSeconds}s</strong></div>
        <div><span>Erratic movement index</span><strong>{signals.erraticMovement.toFixed(2)}</strong></div>
        <div><span>Invalid form attempts</span><strong>{signals.invalidAttempts}</strong></div>
        <div><span>Pointer events</span><strong>{signals.pointerEvents}</strong></div>
      </div>
      <div className="server-note">
        <span className="live-dot" /> Server: {serverUpdate ? `${serverUpdate.level} · ${serverUpdate.score}/100` : "Waiting for telemetry"}
      </div>
      <button className="button button-quiet full-width" onClick={onReset}>Reset telemetry</button>
      <p className="disclaimer">Prototype heuristic only. This score is not a psychological diagnosis or a validated emotion detector.</p>
    </aside>
  );
}
