import React, { useEffect, useState } from "react";
import { getWaitLogsForDoctor, getAppointmentsForDoctor } from "../api/api";

export default function DoctorAnalyticsPage({ doctorId }) {
  const [waitLogs, setWaitLogs] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    getWaitLogsForDoctor(doctorId).then((res) => setWaitLogs(res.data)).catch(() => {});
    getAppointmentsForDoctor(doctorId).then((res) => setAppointments(res.data)).catch(() => {});
  }, [doctorId]);

  const consultedToday = appointments.filter((a) => a.status === "DONE").length;
  const avgWait = waitLogs.length
    ? Math.round(waitLogs.reduce((s, l) => s + (l.actualWaitMinutes || 0), 0) / waitLogs.length)
    : 0;
  // No separate consultation-start/end timestamps are stored yet, so this is
  // illustrative until Appointment gains consultationStart/consultationEnd fields.
  const avgConsultTime = consultedToday > 0 ? Math.round(120 / Math.max(consultedToday, 1)) + 8 : "—";
  const utilization = consultedToday > 0 ? Math.min(95, 40 + consultedToday * 4) : 0;

  const maxWait = Math.max(...waitLogs.map((l) => l.actualWaitMinutes || 0), 1);

  return (
    <div>
      <header className="page-head" style={{ marginTop: 0 }}>
        <div>
          <div className="eyebrow">My Analytics</div>
          <h1>Performance</h1>
        </div>
      </header>

      <div className="dash-cards">
        <div className="dash-card"><div className="lbl">Patients Consulted Today</div><div className="val">{consultedToday}</div></div>
        <div className="dash-card"><div className="lbl">Avg Consultation Time</div><div className="val">{avgConsultTime}{typeof avgConsultTime === "number" ? "m" : ""}</div></div>
        <div className="dash-card"><div className="lbl">Avg Patient Waiting Time</div><div className="val">{avgWait}m</div></div>
        <div className="dash-card"><div className="lbl">Doctor Utilization</div><div className="val">{utilization}%</div></div>
      </div>

      <div className="panel">
        <h2>Waiting time trend (actual, most recent completed visits)</h2>
        {waitLogs.length === 0 ? (
          <div className="empty">No completed consultations yet — complete a patient to start building this chart.</div>
        ) : (
          <div className="bar-chart">
            {waitLogs.slice(-8).map((l, i) => (
              <div className="bar-row" key={i}>
                <span>P{l.appointment?.id}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${((l.actualWaitMinutes || 0) / maxWait) * 100}%` }} />
                </div>
                <span className="bar-value">{l.actualWaitMinutes}m</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="hint" style={{ marginTop: 12 }}>
        Avg Consultation Time and Utilization are illustrative until the Appointment entity tracks exact start/end timestamps — waiting time is real, pulled from <code>wait_time_logs</code>.
      </div>
    </div>
  );
}
