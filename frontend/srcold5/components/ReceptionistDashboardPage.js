import React, { useState, useRef } from "react";
import { registerPatient, bookAppointment, checkInPatient } from "../api/api";
import useLiveQueue from "../hooks/useLiveQueue";
import { severityLabel } from "./StaffView";

const DOCTORS = [
  { id: 1, label: "Dr. Sharma — General Medicine" },
  { id: 2, label: "Dr. Iyer — Cardiology" },
  { id: 3, label: "Dr. Rao — Emergency" },
];
const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function ReceptionistDashboardPage() {
  const { queue } = useLiveQueue();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [doctorId, setDoctorId] = useState(DOCTORS[0].id);
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !severity) {
      setStatus("Enter a name and select a severity.");
      return;
    }
    setSubmitting(true);
    setStatus("Processing...");
    try {
      const patientRes = await registerPatient({ name, contact, age: null, gender: null });
      const appointmentRes = await bookAppointment({
        patient: { id: patientRes.data.id },
        doctor: { id: doctorId },
        scheduledTime: new Date().toISOString(),
      });
      await checkInPatient(appointmentRes.data.id, severity);
      setStatus(`${name} added to queue.`);
      setName(""); setContact(""); setSeverity("");
    } catch (err) {
      setStatus("Something went wrong — is the backend running on port 8080?");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <header className="page-head" style={{ marginTop: 0 }}>
        <div>
          <div className="eyebrow">Receptionist Dashboard</div>
          <h1>Front Desk</h1>
        </div>
      </header>

      <div className="dash-cards" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        <div className="dash-card" style={{ cursor: "pointer" }} onClick={scrollToForm}>
          <div className="ic">📝</div><div className="lbl">Register Patient</div>
        </div>
        <div className="dash-card" style={{ cursor: "pointer" }} onClick={scrollToForm}>
          <div className="ic">📅</div><div className="lbl">Book Appointment</div>
        </div>
        <div className="dash-card" style={{ cursor: "pointer" }} onClick={scrollToForm}>
          <div className="ic">✅</div><div className="lbl">Check-In Patient</div>
        </div>
        <div className="dash-card" style={{ cursor: "pointer" }} onClick={scrollToForm}>
          <div className="ic">🚶</div><div className="lbl">Add Walk-In Patient</div>
        </div>
      </div>

      <div className="panel" ref={formRef} style={{ marginBottom: 22, maxWidth: 420 }}>
        <h2>Patient details</h2>
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
              <div key={s} className={`sev-btn ${severity === s ? "active" : ""}`} data-sev={s} onClick={() => setSeverity(s)}>
                {s}
              </div>
            ))}
          </div>
          <button className="submit" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </form>
        {status && <div className="status-msg">{status}</div>}
      </div>

      <div className="panel">
        <h2>Today's Queue</h2>
        <div className="queue-list">
          {queue.length === 0 && <div className="empty">No patients in queue.</div>}
          {queue.map((entry) => {
            const isConsulting = entry.appointment?.status === "IN_PROGRESS";
            return (
              <div className="row" key={entry.id}>
                <div className="pos">P{entry.appointment?.id}</div>
                <div className="who">
                  <b>{entry.appointment?.patient?.name}</b>
                  <span>{entry.appointment?.doctor?.name}</span>
                </div>
                <div className={`tag ${severityLabel(entry.priorityScore)}`}>{severityLabel(entry.priorityScore)}</div>
                <div className="wait"><b>{isConsulting ? "Consulting" : "Waiting"}</b></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
