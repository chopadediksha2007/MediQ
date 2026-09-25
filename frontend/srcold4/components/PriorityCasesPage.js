import React, { useState } from "react";
import useLiveQueue from "../hooks/useLiveQueue";
import { severityLabel } from "./StaffView";

function reasonsFor(sev) {
  const reasons = [];
  if (sev === "CRITICAL" || sev === "HIGH") reasons.push("High severity");
  if (sev === "CRITICAL") reasons.push("Emergency");
  reasons.push("Waiting time");
  return reasons;
}

export default function PriorityCasesPage() {
  const { queue } = useLiveQueue();
  const [selectedId, setSelectedId] = useState(null);

  const sorted = [...queue].sort((a, b) => b.priorityScore - a.priorityScore);
  const selected = sorted.find((e) => e.id === selectedId) || null;

  return (
    <div>
      <header className="page-head" style={{ marginTop: 0 }}>
        <div>
          <div className="eyebrow">Priority Cases</div>
          <h1>🚨 Emergency Management</h1>
        </div>
      </header>

      <div className="panel">
        {sorted.length === 0 ? (
          <div className="empty">No patients in the queue.</div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Patient</th><th>Severity</th><th>Wait</th><th>Priority Score</th><th></th></tr></thead>
            <tbody>
              {sorted.map((e) => {
                const sev = severityLabel(e.priorityScore);
                const waitMin = Math.round((Date.now() - new Date(e.entryTime).getTime()) / 60000);
                return (
                  <tr key={e.id}>
                    <td>P{e.appointment?.id}</td>
                    <td>{sev}</td>
                    <td>{waitMin}m</td>
                    <td>{Math.round(e.priorityScore)}</td>
                    <td><button className="link-btn" onClick={() => setSelectedId(e.id)}>View</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {selected && (
          <div className="priority-detail">
            <div className="reg-section-title">Patient: P{selected.appointment?.id}</div>
            <div className="row"><span>Severity</span><span className={`tag ${severityLabel(selected.priorityScore)}`}>{severityLabel(selected.priorityScore)}</span></div>
            <div className="row"><span>Priority Score</span><span>{Math.round(selected.priorityScore)}</span></div>
            <div className="row"><span>Reason</span><span></span></div>
            <ul className="reason-list">
              {reasonsFor(severityLabel(selected.priorityScore)).map((r, i) => <li key={i}>{r}</li>)}
            </ul>
            <button className="submit" disabled>Already Prioritized</button>
          </div>
        )}
      </div>
    </div>
  );
}
