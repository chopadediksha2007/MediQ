import React, { useState } from "react";
import { registerPatient, bookAppointment, checkInPatient } from "../api/api";

const DOCTORS = [
  { id: 1, label: "Dr. Sharma — General Medicine" },
  { id: 2, label: "Dr. Iyer — Cardiology" },
  { id: 3, label: "Dr. Rao — Emergency" },
];

const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function CheckInForm() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [doctorId, setDoctorId] = useState(DOCTORS[0].id);
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !severity) {
      setStatus("Please enter a name and select a severity.");
      return;
    }
    setSubmitting(true);
    setStatus("Registering patient...");
    try {
      const patientRes = await registerPatient({ name, contact, age: null, gender: null });
      const patientId = patientRes.data.id;

      setStatus("Booking appointment...");
      const appointmentRes = await bookAppointment({
        patient: { id: patientId },
        doctor: { id: doctorId },
        scheduledTime: new Date().toISOString(),
      });
      const appointmentId = appointmentRes.data.id;

      setStatus("Checking in...");
      await checkInPatient(appointmentId, severity);

      setStatus(`${name} checked in successfully.`);
      setName("");
      setContact("");
      setSeverity("");
    } catch (err) {
      console.error(err);
      setStatus("Something went wrong. Is the backend running on port 8080?");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "420px", fontFamily: "sans-serif", borderBottom: "1px solid #ddd" }}>
      <h2>Check in a patient</h2>
      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Patient name</label>
        <input
          style={inputStyle}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Ravi Kumar"
        />

        <label style={labelStyle}>Contact number</label>
        <input
          style={inputStyle}
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="e.g. 9999999999"
        />

        <label style={labelStyle}>Doctor</label>
        <select style={inputStyle} value={doctorId} onChange={(e) => setDoctorId(Number(e.target.value))}>
          {DOCTORS.map((d) => (
            <option key={d.id} value={d.id}>{d.label}</option>
          ))}
        </select>

        <label style={labelStyle}>Triage severity</label>
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
          {SEVERITIES.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setSeverity(s)}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "6px",
                border: severity === s ? "2px solid #333" : "1px solid #ccc",
                background: severity === s ? "#333" : "#fff",
                color: severity === s ? "#fff" : "#333",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "12px",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <button type="submit" disabled={submitting} style={submitStyle}>
          {submitting ? "Submitting..." : "Check in"}
        </button>
      </form>
      {status && <p style={{ marginTop: "12px", fontSize: "13px", color: "#555" }}>{status}</p>}
    </div>
  );
}

const labelStyle = { display: "block", fontSize: "12px", color: "#555", margin: "10px 0 4px" };
const inputStyle = { width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "6px", fontSize: "14px" };
const submitStyle = {
  width: "100%",
  marginTop: "10px",
  padding: "10px",
  border: "none",
  borderRadius: "6px",
  background: "#0E5E56",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};