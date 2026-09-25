import React, { useState } from "react";
import { registerPatient, bookAppointment, checkInPatient } from "../api/api";
import useLiveQueue from "../hooks/useLiveQueue";

const DOCTORS = [
  { id: 1, label: "Dr. Sharma — General Medicine", avgConsult: 12 },
  { id: 2, label: "Dr. Iyer — Cardiology", avgConsult: 20 },
  { id: 3, label: "Dr. Rao — Emergency", avgConsult: 8 },
];
const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

function explanationFor(sev, idx) {
  if (sev === "CRITICAL") return "Moved to the front — critical severity.";
  if (sev === "HIGH") return "Prioritized ahead of medium/low cases.";
  if (idx === 0) return "Next in line.";
  return "Wait based on queue position and doctor pace.";
}

export default function StaffView() {
  const { queue } = useLiveQueue();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [doctorId, setDoctorId] = useState(DOCTORS[0].id);
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [clock, setClock] = useState(new Date());

  React.useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !severity) {
      setStatus("Enter a name and select a severity.");
      return;
    }
    setSubmitting(true);
    setStatus("Checking in...");
    try {
      const patientRes = await registerPatient({ name, contact, age: null, gender: null });
      const appointmentRes = await bookAppointment({
        patient: { id: patientRes.data.id },
        doctor: { id: doctorId },
        scheduledTime: new Date().toISOString(),
      });
      await checkInPatient(appointmentRes.data.id, severity);
      setStatus(`${name} checked in.`);
      setName("");
      setContact("");
      setSeverity("");
    } catch (err) {
      setStatus("Something went wrong — is the backend running on port 8080?");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <header className="page-head">
        <div>
          <div className="eyebrow">Staff view</div>
          <h1>Live Queue</h1>
        </div>
        <div className="clock"><span>Local time</span><b>{clock.toLocaleTimeString()}</b></div>
      </header>

      <div className="grid">
        <div className="panel">
          <h2>Check in a patient</h2>
          <form onSubmit={handleSubmit}>
            <label>Patient name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rohan Verma" />

            <label>Contact number</label>
            <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="e.g. 9999999999" />

            <label>Doctor</label>
            <select value={doctorId} onChange={(e) => setDoctorId(Number(e.target.value))}>
              {DOCTORS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>

            <label>Triage severity</label>
            <div className="sev-grid">
              {SEVERITIES.map((s) => (
                <div
                  key={s}
                  className={`sev-btn ${severity === s ? "active" : ""}`}
                  data-sev={s}
                  onClick={() => setSeverity(s)}
                >
                  {s}
                </div>
              ))}
            </div>

            <button className="submit" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Check in"}
            </button>
          </form>
          {status && <div className="status-msg">{status}</div>}
          <div className="hint">Calls <code>POST /api/appointments/{"{id}"}/check-in</code> → queue re-sorts and broadcasts live over WebSocket.</div>
        </div>

        <div className="panel">
          <h2>Live queue (auto-sorted by priority)</h2>
          <div className="queue-list">
            {queue.length === 0 && <div className="empty">No patients checked in yet — add one on the left.</div>}
            {queue.map((entry, idx) => (
              <div className="row" key={entry.id}>
                <div className="pos">{idx + 1}</div>
                <div className="who">
                  <b>{entry.appointment?.patient?.name || "—"}</b>
                  <span>{entry.appointment?.doctor?.name || "—"}</span>
                  <span className="why">{explanationFor(severityLabel(entry.priorityScore), idx)}</span>
                </div>
                <div className={`tag ${severityLabel(entry.priorityScore)}`}>{severityLabel(entry.priorityScore)}</div>
                <div className="wait">
                  <b>{new Date(entry.entryTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</b>
                  <span>checked in</span>
                </div>
              </div>
            ))}
          </div>
          <div className="legend">
            <span><span className="dot" style={{ background: "var(--critical)" }}></span>Critical</span>
            <span><span className="dot" style={{ background: "var(--high)" }}></span>High</span>
            <span><span className="dot" style={{ background: "var(--medium)" }}></span>Medium</span>
            <span><span className="dot" style={{ background: "var(--low)" }}></span>Low</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function severityLabel(score) {
  if (score >= 100) return "CRITICAL";
  if (score >= 50) return "HIGH";
  if (score >= 10) return "MEDIUM";
  return "LOW";
}
