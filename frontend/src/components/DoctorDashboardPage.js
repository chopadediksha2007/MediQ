import React, { useEffect, useState } from "react";
import useLiveQueue from "../hooks/useLiveQueue";
import { severityLabel } from "./StaffView";
import { getAppointmentsForDoctor, startConsultation, completeConsultation } from "../api/api";

const DOCTORS = [
  { id: 1, name: "Dr. Sharma" },
  { id: 2, name: "Dr. Iyer" },
  { id: 3, name: "Dr. Rao" },
];

export default function DoctorDashboardPage() {
  const { queue } = useLiveQueue();
  const [doctorId, setDoctorId] = useState(DOCTORS[0].id);
  const [allAppointments, setAllAppointments] = useState([]);
  const [busy, setBusy] = useState(false);

  const doctorName = DOCTORS.find((d) => d.id === doctorId)?.name;
  const doctorQueue = queue.filter((e) => e.appointment?.doctor?.id === doctorId);
  const currentPatient = doctorQueue.find((e) => e.appointment?.status === "IN_PROGRESS") || null;
  const nextUp = !currentPatient && doctorQueue.length > 0 ? doctorQueue[0] : null;

  const refreshAppointments = () => {
    getAppointmentsForDoctor(doctorId).then((res) => setAllAppointments(res.data)).catch(() => {});
  };

  useEffect(() => {
    refreshAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, queue.length]);

  const completed = allAppointments.filter((a) => a.status === "DONE").length;
  const total = allAppointments.length;
  const waiting = doctorQueue.length;
  const emergencyCount = doctorQueue.filter((e) => severityLabel(e.priorityScore) === "CRITICAL").length;
  const waitingMinutes = (entry) => Math.max(Math.round((Date.now() - new Date(entry.entryTime).getTime()) / 60000), 0);

  const handleStart = async (appointmentId) => {
    setBusy(true);
    try { await startConsultation(appointmentId); } finally { setBusy(false); }
  };
  const handleComplete = async (appointmentId) => {
    setBusy(true);
    try { await completeConsultation(appointmentId); refreshAppointments(); } finally { setBusy(false); }
  };

  return (
    <div>
      <header className="page-head" style={{ marginTop: 0 }}>
        <div>
          <div className="eyebrow">Doctor Dashboard</div>
          <h1>{doctorName}</h1>
        </div>
        <select style={{ width: 220 }} value={doctorId} onChange={(e) => setDoctorId(Number(e.target.value))}>
          {DOCTORS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </header>

      <div className="dash-cards" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        <div className="dash-card"><div className="lbl">Today's Patients</div><div className="val">{total}</div></div>
        <div className="dash-card"><div className="lbl">Completed</div><div className="val">{completed}</div></div>
        <div className="dash-card"><div className="lbl">Waiting</div><div className="val">{waiting}</div></div>
        <div className="dash-card"><div className="lbl">Emergency Cases</div><div className="val">{emergencyCount}</div></div>
      </div>

      <div className="appt-card">
        <div className="reg-section-title" style={{ marginBottom: 14 }}>Current Patient</div>
        {currentPatient ? (
          <>
            <div className="row"><span>Patient</span><span>P{currentPatient.appointment?.id}</span></div>
            <div className="row"><span>Priority</span><span className={`tag ${severityLabel(currentPatient.priorityScore)}`}>{severityLabel(currentPatient.priorityScore)}</span></div>
            <div className="row"><span>Waiting</span><span>{waitingMinutes(currentPatient)} min</span></div>
            <button className="submit" style={{ marginTop: 16 }} disabled={busy} onClick={() => handleComplete(currentPatient.appointment.id)}>
              Complete
            </button>
          </>
        ) : nextUp ? (
          <>
            <div className="row"><span>Next patient</span><span>P{nextUp.appointment?.id}</span></div>
            <div className="row"><span>Priority</span><span className={`tag ${severityLabel(nextUp.priorityScore)}`}>{severityLabel(nextUp.priorityScore)}</span></div>
            <div className="row"><span>Waiting</span><span>{waitingMinutes(nextUp)} min</span></div>
            <button className="submit" style={{ marginTop: 16 }} disabled={busy} onClick={() => handleStart(nextUp.appointment.id)}>
              Start Consultation
            </button>
          </>
        ) : (
          <p style={{ color: "var(--muted)", fontSize: 13.5, margin: 0 }}>No patients waiting right now.</p>
        )}
      </div>

      <div className="panel">
        <h2>Queue</h2>
        <div className="queue-list">
          {doctorQueue.length === 0 && <div className="empty">No patients in queue.</div>}
          {doctorQueue.map((entry, idx) => {
            const sev = severityLabel(entry.priorityScore);
            const isConsulting = entry.appointment?.status === "IN_PROGRESS";
            return (
              <div className="row" key={entry.id}>
                <div className="pos">{idx + 1}</div>
                <div className="who"><b>P{entry.appointment?.id}</b></div>
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
