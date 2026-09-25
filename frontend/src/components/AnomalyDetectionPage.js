import React from "react";
import useLiveQueue from "../hooks/useLiveQueue";

// No historical per-hour baseline is tracked yet, so "normal" is a reasonable
// fixed threshold per department for demo purposes. A real version would pull
// this from historical wait_time_logs averages.
const NORMAL_THRESHOLD = 4;

export default function AnomalyDetectionPage() {
  const { queue } = useLiveQueue();

  const byDept = {};
  queue.forEach((e) => {
    const dept = e.appointment?.doctor?.department?.name || e.appointment?.doctor?.name || "Unknown";
    byDept[dept] = (byDept[dept] || 0) + 1;
  });

  const anomalies = Object.entries(byDept).filter(([, count]) => count > NORMAL_THRESHOLD);

  return (
    <div>
      <header className="page-head" style={{ marginTop: 0 }}>
        <div><div className="eyebrow">Admin</div><h1>Anomaly Detection</h1></div>
      </header>

      <div className="panel">
        {anomalies.length === 0 ? (
          <div className="empty">No unusual activity detected — all departments are within normal range.</div>
        ) : (
          anomalies.map(([dept, count]) => (
            <div className="notif-item" key={dept} style={{ borderColor: "var(--critical)", background: "#FDEDEA" }}>
              <div className="notif-dot">⚠️</div>
              <div className="notif-body" style={{ flex: 1 }}>
                <b>Unusual patient surge detected</b>
                <div style={{ marginTop: 8 }}>
                  <div className="row"><span>Department</span><span>{dept}</span></div>
                  <div className="row"><span>Normal patients/queue</span><span>{NORMAL_THRESHOLD}</span></div>
                  <div className="row"><span>Current</span><span>{count}</span></div>
                  <div className="row"><span>Status</span><span className="tag CRITICAL">HIGH SURGE</span></div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button className="submit" style={{ marginTop: 0 }}>View Queue</button>
                  <button className="submit" style={{ marginTop: 0, background: "var(--critical)" }}>Notify Admin</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="hint" style={{ marginTop: 12 }}>
        Threshold is a fixed demo value ({NORMAL_THRESHOLD} patients) — a production version would compare
        against each department's historical average instead.
      </div>
    </div>
  );
}
