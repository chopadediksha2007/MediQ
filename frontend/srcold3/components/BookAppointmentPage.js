import React, { useState } from "react";
import { registerPatient, bookAppointment, checkInPatient } from "../api/api";

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

export default function BookAppointmentPage({ user, onBooked }) {
  const [doctorId, setDoctorId] = useState(DOCTORS[0].id);
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!severity) {
      setStatus("Select an urgency level.");
      return;
    }
    setSubmitting(true);
    setStatus("Booking...");
    try {
      let patientId = user?.patientId;
      if (!patientId) {
        const patientRes = await registerPatient({ name: user?.name || "Patient", contact: "", age: null, gender: null });
        patientId = patientRes.data.id;
      }
      const appointmentRes = await bookAppointment({
        patient: { id: patientId },
        doctor: { id: doctorId },
        scheduledTime: new Date().toISOString(),
      });
      await checkInPatient(appointmentRes.data.id, severity);
      onBooked({ patientId, appointmentId: appointmentRes.data.id });
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
          <div className="eyebrow">Appointments</div>
          <h1>Book an appointment</h1>
        </div>
      </header>

      <div className="panel" style={{ maxWidth: 420 }}>
        <h2>Choose a doctor and severity</h2>
        <form onSubmit={handleSubmit}>
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

          <button className="submit" type="submit" disabled={submitting}>
            {submitting ? "Booking..." : "Book & Check In"}
          </button>
        </form>
        {status && <div className="status-msg">{status}</div>}
        <div className="hint">Final severity is confirmed by a nurse at triage — this is your starting point.</div>
      </div>
    </div>
  );
}
