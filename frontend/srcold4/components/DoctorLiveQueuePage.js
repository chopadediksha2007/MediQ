import React, { useState } from "react";
import useLiveQueue from "../hooks/useLiveQueue";
import { severityLabel } from "./StaffView";
import { startConsultation, completeConsultation } from "../api/api";

export default function DoctorLiveQueuePage({ doctorId }) {
  const { queue } = useLiveQueue();
  const [busy, setBusy] = useState(false);

  const doctorQueue = queue.filter((e) => e.appointment?.doctor?.id === doctorId);
  const current = doctorQueue.find((e) => e.appointment?.status === "IN_PROGRESS") || null;
  const rest = doctorQueue.filter((e) => e.appointment?.status !== "IN_PROGRESS");
  const next = rest[0] || null;
  const upcoming = rest.slice(1);

  const handleStart = async (id) => { setBusy(true); try { await startConsultation(id); } finally { setBusy(false); } };
  const handleComplete = async (id) => { setBusy(true); try { await completeConsultation(id); } finally { setBusy(false); } };

  return (
    <div>
      <header className="page-head" style={{ marginTop: 0 }}>
        <div>
          <div className="eyebrow">Live Queue</div>
          <h1>Doctor's Queue</h1>
        </div>
      </header>

      <div className="queue-columns">
        <div className="panel">
          <div className="queue-col-title">Currently Consulting</div>
          <div className="queue-col-value">{current ? `P${current.appointment.id}` : "—"}</div>
          {current && (
            <button className="submit" disabled={busy} onClick={() => handleComplete(current.appointment.id)}>
              Complete Consultation
            </button>
          )}
        </div>
        <div className="panel">
          <div className="queue-col-title">Next Patient</div>
          <div className="queue-col-value">{next ? `P${next.appointment.id}` : "—"}</div>
          {next && !current && (
            <button className="submit" disabled={busy} onClick={() => handleStart(next.appointment.id)}>
              Start Consultation
            </button>
          )}
        </div>
        <div className="panel">
          <div className="queue-col-title">Upcoming</div>
          {upcoming.length === 0 ? (
            <div className="empty">No one else waiting.</div>
          ) : (
            <div className="queue-list">
              {upcoming.map((e) => (
                <div className="row" key={e.id}>
                  <div className="who"><b>P{e.appointment.id}</b></div>
                  <div className={`tag ${severityLabel(e.priorityScore)}`}>{severityLabel(e.priorityScore)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="hint" style={{ marginTop: 16 }}>
        Clicking Complete removes the patient, recalculates the queue, and broadcasts the update to every connected screen — including the patient's own dashboard — instantly over WebSocket.
      </div>
    </div>
  );
}
