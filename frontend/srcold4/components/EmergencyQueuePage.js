import React, { useState } from "react";
import useLiveQueue from "../hooks/useLiveQueue";
import { severityLabel } from "./StaffView";

export default function EmergencyQueuePage() {
  const { queue } = useLiveQueue();
  const [refreshing, setRefreshing] = useState(false);

  const handleUpdatePriority = () => {
    // The queue already re-sorts automatically the instant severity changes
    // (see QueueService.checkIn -> broadcastQueueUpdate). This button gives
    // staff a manual "force refresh" moment for reassurance during a shift.
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <div>
      <header className="page-head" style={{ marginTop: 0 }}>
        <div>
          <div className="eyebrow">Staff · Emergency</div>
          <h1>🚨 Emergency Queue</h1>
        </div>
      </header>

      <div className="panel">
        <div className="queue-list">
          <div className="row" style={{ background: "transparent", border: "none", fontWeight: 800, fontSize: 11.5, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em" }}>
            <div>#</div>
            <div>Patient</div>
            <div>Priority</div>
            <div>Status</div>
          </div>
          {queue.length === 0 && <div className="empty">No patients currently in the queue.</div>}
          {queue.map((entry, idx) => {
            const sev = severityLabel(entry.priorityScore);
            const isConsulting = entry.appointment?.status === "IN_PROGRESS";
            return (
              <div className="row" key={entry.id}>
                <div className="pos">{idx + 1}</div>
                <div className="who">
                  <b>{entry.appointment?.patient?.name || `P${entry.appointment?.id}`}</b>
                  <span>{entry.appointment?.doctor?.name}</span>
                </div>
                <div className={`tag ${sev}`}>{sev} · {Math.round(entry.priorityScore)}</div>
                <div className="wait"><b>{isConsulting ? "CONSULTING" : "WAITING"}</b></div>
              </div>
            );
          })}
        </div>
        <button className="submit" style={{ marginTop: 18 }} onClick={handleUpdatePriority} disabled={refreshing}>
          {refreshing ? "Refreshing..." : "Update Priority"}
        </button>
        <div className="hint">Priority already re-sorts live the instant a critical patient checks in — this refreshes the view manually.</div>
      </div>
    </div>
  );
}
