import React, { useState } from "react";
import { registerPatient, bookAppointment, checkInPatient } from "../api/api";
import useLiveQueue from "../hooks/useLiveQueue";
import { severityLabel } from "./StaffView";

const DOCTORS = [
  { id: 1, label: "Dr. Sharma — General Medicine" },
  { id: 2, label: "Dr. Iyer — Cardiology" },
  { id: 3, label: "Dr. Rao — Emergency" },
];
const SEVERITIES = [
  { key: "LOW", label: "Routine" },
  { key: "MEDIUM", label: "Concerning" },
  { key: "HIGH", label: "Urgent" },
  { key: "CRITICAL", label: "Emergency" },
];

function explanationFor(sev, idx) {
  if (sev === "CRITICAL") return "Moved to the front — critical severity.";
  if (sev === "HIGH") return "Prioritized ahead of medium/low cases.";
  if (idx === 0) return "Next in line.";
  return "Wait based on queue position and doctor pace.";
}

export default function PatientView() {
  const { queue } = useLiveQueue();
  const [name, setName] = useState("");
  const [doctorId, setDoctorId] = useState(DOCTORS[0].id);
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [myAppointmentId, setMyAppointmentId] = useState(null);
  const [clock, setClock] = useState(new Date());

  React.useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !severity) {
      setStatus("Enter your name and select an urgency level.");
      return;
    }
    setSubmitting(true);
    setStatus("Checking in...");
    try {
      const patientRes = await registerPatient({ name, contact: "", age: null, gender: null });
      const appointmentRes = await bookAppointment({
        patient: { id: patientRes.data.id },
        doctor: { id: doctorId },
        scheduledTime: new Date().toISOString(),
      });
      await checkInPatient(appointmentRes.data.id, severity);
      setMyAppointmentId(appointmentRes.data.id);
      setStatus("");
    } catch (err) {
      setStatus("Something went wrong — is the backend running on port 8080?");
    } finally {
      setSubmitting(false);
    }
  };

  const myIndex = queue.findIndex((e) => e.appointment?.id === myAppointmentId);
  const myEntry = myIndex >= 0 ? queue[myIndex] : null;

  return (
    <section>
      <header className="page-head">
        <div>
          <div className="eyebrow">Patient view</div>
          <h1>Your visit status</h1>
        </div>
        <div className="clock"><span>Local time</span><b>{clock.toLocaleTimeString()}</b></div>
      </header>

      {myEntry ? (
        <div className="status-card">
          <div className="lbl">Position</div>
          <div className="big">{myIndex + 1} of {queue.length}</div>
          <div className="sub">
            {myEntry.appointment?.doctor?.name} · {severityLabel(myEntry.priorityScore)} priority · {explanationFor(severityLabel(myEntry.priorityScore), myIndex)}
          </div>
        </div>
      ) : (
        <div className="panel" style={{ marginBottom: 20 }}>
          <div className="no-patient">
            {myAppointmentId
              ? "You've been checked in but aren't showing in the queue yet — refresh in a moment."
              : "You haven't checked in yet. Fill out the form below to see your live position and status."}
          </div>
        </div>
      )}

      <div className="panel">
        <h2>Check yourself in</h2>
        <form onSubmit={handleSubmit}>
          <label>Your name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Anjali Mehta" />

          <label>Doctor</label>
          <select value={doctorId} onChange={(e) => setDoctorId(Number(e.target.value))}>
            {DOCTORS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>

          <label>How urgent does this feel?</label>
          <div className="sev-grid">
            {SEVERITIES.map((s) => (
              <div
                key={s.key}
                className={`sev-btn ${severity === s.key ? "active" : ""}`}
                data-sev={s.key}
                onClick={() => setSeverity(s.key)}
              >
                {s.label}
              </div>
            ))}
          </div>

          <button className="submit" type="submit" disabled={submitting || !!myAppointmentId}>
            {myAppointmentId ? "Checked in" : submitting ? "Submitting..." : "Check in"}
          </button>
        </form>
        {status && <div className="status-msg">{status}</div>}
        <div className="hint">Final severity is confirmed by a nurse at triage — this is your self-reported starting point.</div>
      </div>
    </section>
  );
}
