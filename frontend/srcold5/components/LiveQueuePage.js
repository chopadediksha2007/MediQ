import React from "react";
import useLiveQueue from "../hooks/useLiveQueue";
import { severityLabel } from "./StaffView";

const SEVERITY_DOT = { CRITICAL: "🔴", HIGH: "🟠", MEDIUM: "🟡", LOW: "🟢" };
const SEVERITY_NAME = { CRITICAL: "Emergency", HIGH: "High", MEDIUM: "Medium", LOW: "Normal" };

function predictWait(idxAhead, avgConsult, sevScore) {
  const base = idxAhead * avgConsult * 0.5;
  const reduction = sevScore * 0.8;
  return Math.max(Math.round(base - reduction), 2);
}

export default function LiveQueuePage({ myAppointmentId }) {
  const { queue } = useLiveQueue();

  const myGlobalIndex = queue.findIndex((e) => e.appointment?.id === myAppointmentId);
  const myEntry = myGlobalIndex >= 0 ? queue[myGlobalIndex] : null;
  const myDoctorId = myEntry?.appointment?.doctor?.id;

  // Scope the queue to just my doctor/department, matching the mockup's per-doctor view
  const doctorQueue = myDoctorId
    ? queue.filter((e) => e.appointment?.doctor?.id === myDoctorId)
    : queue;

  const myDoctorIndex = doctorQueue.findIndex((e) => e.appointment?.id === myAppointmentId);
  const currentPatient = doctorQueue.find((e) => e.appointment?.status === "IN_PROGRESS") || null;
  const wait = myEntry ? predictWait(myDoctorIndex, 15, myEntry.priorityScore) : null;

  return (
    <div>
      <header className="page-head" style={{ marginTop: 0 }}>
        <div>
          <div className="eyebrow">Live Queue</div>
          <h1>{myEntry?.appointment?.doctor?.name || "Hospital"} Queue</h1>
        </div>
      </header>

      <div className="panel" style={{ marginBottom: 20, textAlign: "center" }}>
        <h2>Current Patient</h2>
        {currentPatient ? (
          <>
            <div style={{ fontSize: 36, fontWeight: 800, margin: "8px 0" }}>
              P{currentPatient.appointment?.id}
            </div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>Consultation in progress</div>
          </>
        ) : (
          <div style={{ color: "var(--muted)", fontSize: 13, padding: "10px 0" }}>
            No patient currently in consultation
          </div>
        )}
      </div>

      {myEntry && (
        <div className="dash-cards">
          <div className="dash-card">
            <div className="lbl">Your Position</div>
            <div className="val">#{myDoctorIndex + 1}</div>
          </div>
          <div className="dash-card">
            <div className="lbl">Patients Ahead</div>
            <div className="val">{myDoctorIndex}</div>
          </div>
          <div className="dash-card">
            <div className="lbl">Predicted Waiting Time</div>
            <div className="val">{wait} min</div>
          </div>
        </div>
      )}

      <div className="panel">
        <h2>Queue</h2>
        <div className="queue-list">
          {doctorQueue.length === 0 && <div className="empty">No one is currently in the queue.</div>}
          {doctorQueue.map((entry, idx) => {
            const isMe = entry.appointment?.id === myAppointmentId;
            const sev = severityLabel(entry.priorityScore);
            const isConsulting = entry.appointment?.status === "IN_PROGRESS";
            return (
              <div className="row" key={entry.id} style={isMe ? { borderColor: "var(--teal)", background: "#F0F7F6" } : {}}>
                <div className="pos">{idx + 1}</div>
                <div className="who">
                  <b>{isMe ? "YOU" : `P${entry.appointment?.id}`}</b>
                  <span>{SEVERITY_DOT[sev]} {SEVERITY_NAME[sev]}</span>
                </div>
                <div className={`tag ${sev}`}>{sev}</div>
                <div className="wait"><b>{isConsulting ? "Consulting" : "Waiting"}</b></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
