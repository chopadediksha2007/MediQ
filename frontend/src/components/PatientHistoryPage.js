import React, { useEffect, useState } from "react";
import { getAppointmentsForPatient, getWaitLogsForPatient } from "../api/api";

const TABS = [
  { key: "appointments", label: "Appointments" },
  { key: "consultations", label: "Consultations" },
  { key: "waiting", label: "Waiting History" },
];

const STATUS_MAP = { SCHEDULED: "Waiting", WAITING: "Waiting", IN_PROGRESS: "Consulting", DONE: "Completed" };

export default function PatientHistoryPage({ patientId }) {
  const [tab, setTab] = useState("appointments");
  const [appointments, setAppointments] = useState([]);
  const [waitLogs, setWaitLogs] = useState([]);

  useEffect(() => {
    if (!patientId) return;
    getAppointmentsForPatient(patientId).then((res) => setAppointments(res.data)).catch(() => {});
    getWaitLogsForPatient(patientId).then((res) => setWaitLogs(res.data)).catch(() => {});
  }, [patientId]);

  const rows = tab === "waiting"
    ? waitLogs.map((log) => ({
        date: log.appointment?.scheduledTime ? new Date(log.appointment.scheduledTime).toLocaleDateString() : "—",
        doctor: log.appointment?.doctor?.name || "—",
        department: log.appointment?.doctor?.department?.name || "—",
        wait: log.actualWaitMinutes != null ? `${log.actualWaitMinutes} min` : "—",
        status: "Completed",
      }))
    : appointments
        .filter((a) => tab === "appointments" || a.status === "DONE")
        .map((a) => ({
          date: a.scheduledTime ? new Date(a.scheduledTime).toLocaleDateString() : "—",
          doctor: a.doctor?.name || "—",
          department: a.doctor?.department?.name || "—",
          wait: a.predictedWaitMinutes != null ? `${a.predictedWaitMinutes} min` : "—",
          status: STATUS_MAP[a.status] || a.status,
        }));

  return (
    <div>
      <header className="page-head" style={{ marginTop: 0 }}>
        <div>
          <div className="eyebrow">History</div>
          <h1>Your visit history</h1>
        </div>
      </header>

      <div className="tab-row">
        {TABS.map((t) => (
          <div key={t.key} className={`tab-btn ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>
            {t.label}
          </div>
        ))}
      </div>

      <div className="panel">
        {!patientId ? (
          <div className="empty">Book an appointment first to start building your history.</div>
        ) : rows.length === 0 ? (
          <div className="empty">Nothing here yet.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Doctor</th><th>Department</th><th>Wait Time</th><th>Status</th></tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.date}</td>
                  <td>{r.doctor}</td>
                  <td>{r.department}</td>
                  <td>{r.wait}</td>
                  <td><span className={`status-chip ${r.status}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="hint" style={{ marginTop: 12 }}>
        This is the real data your wait-time ML model would retrain on over time — see <code>wait_time_logs</code> in the database.
      </div>
    </div>
  );
}
