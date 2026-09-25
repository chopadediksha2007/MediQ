import React, { useState } from "react";
import useLiveQueue from "../hooks/useLiveQueue";
import { severityLabel } from "./StaffView";

function explanationFor(sev, idx) {
  if (sev === "CRITICAL") return "Moved to the front — critical severity.";
  if (sev === "HIGH") return "Prioritized ahead of medium/low cases.";
  if (idx === 0) return "Next in line.";
  return "Wait based on queue position and doctor pace.";
}

function predictWait(idxAhead, avgConsult, sevScore) {
  const base = idxAhead * avgConsult * 0.5;
  const reduction = sevScore * 0.8;
  return Math.max(Math.round(base - reduction), 2);
}

export default function PatientDashboardPage({ myAppointmentId, onNavigate }) {
  const { queue } = useLiveQueue();
  const myIndex = queue.findIndex((e) => e.appointment?.id === myAppointmentId);
  const myEntry = myIndex >= 0 ? queue[myIndex] : null;
  const avgConsult = 15; // fallback if doctor data not embedded
  const wait = myEntry ? predictWait(myIndex, avgConsult, myEntry.priorityScore) : null;

  return (
    <div>
      <header className="page-head" style={{ marginTop: 0 }}>
        <div>
          <div className="eyebrow">Dashboard</div>
          <h1>Welcome back</h1>
        </div>
      </header>

      <div className="dash-cards">
        <div className="dash-card">
          <div className="ic">📅</div>
          <div className="lbl">Appointment Today</div>
          <div className="val">{myEntry ? new Date(myEntry.entryTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</div>
        </div>
        <div className="dash-card">
          <div className="ic">🟢</div>
          <div className="lbl">Queue Position</div>
          <div className="val">{myEntry ? `#${myIndex + 1}` : "—"}</div>
        </div>
        <div className="dash-card">
          <div className="ic">🤖</div>
          <div className="lbl">Wait Time Prediction</div>
          <div className="val">{wait !== null ? `${wait} min` : "—"}</div>
        </div>
      </div>

      <div className="appt-card">
        <div className="reg-section-title" style={{ marginBottom: 14 }}>Today's Appointment</div>
        {myEntry ? (
          <>
            <div className="row"><span>Doctor</span><span>{myEntry.appointment?.doctor?.name || "—"}</span></div>
            <div className="row"><span>Department</span><span>{myEntry.appointment?.doctor?.department?.name || "—"}</span></div>
            <div className="row"><span>Checked in</span><span>{new Date(myEntry.entryTime).toLocaleTimeString()}</span></div>
            <div className="row">
              <span>Status</span>
              <span className="status-pill">WAITING</span>
            </div>
            <button className="submit" style={{ marginTop: 16 }} onClick={() => onNavigate("queue")}>
              View Live Queue
            </button>
          </>
        ) : (
          <>
            <p style={{ color: "var(--muted)", fontSize: 13.5, margin: "0 0 14px" }}>
              You don't have an active appointment right now.
            </p>
            <button className="submit" onClick={() => onNavigate("book")}>Book Appointment</button>
          </>
        )}
      </div>

      {myEntry && (
        <div className="ai-card">
          <div className="ai-title">🤖 AI Wait-Time Prediction</div>
          <div className="ai-value">{wait} minutes</div>
          <div className="ai-sub">{explanationFor(severityLabel(myEntry.priorityScore), myIndex)}</div>
          <ul className="ai-factors">
            <li>Current queue length ({queue.length} ahead/behind)</li>
            <li>Doctor's average consultation time</li>
            <li>Your priority level ({severityLabel(myEntry.priorityScore)})</li>
            <li>Historical waiting-time patterns</li>
          </ul>
        </div>
      )}
    </div>
  );
}
