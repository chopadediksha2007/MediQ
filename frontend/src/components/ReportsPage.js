import React, { useEffect, useState } from "react";
import { getAllAppointments, getAllWaitLogs } from "../api/api";
import useLiveQueue from "../hooks/useLiveQueue";
import { severityLabel } from "./StaffView";

const TABS = ["Daily", "Weekly", "Monthly", "Custom"];

export default function ReportsPage() {
  const { queue } = useLiveQueue();
  const [tab, setTab] = useState("Daily");
  const [appointments, setAppointments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    getAllAppointments().then((res) => setAppointments(res.data)).catch(() => {});
    getAllWaitLogs().then((res) => setLogs(res.data)).catch(() => {});
  }, []);

  const patientVolume = appointments.length;
  const avgWait = logs.length ? Math.round(logs.reduce((s, l) => s + (l.actualWaitMinutes || 0), 0) / logs.length) : 0;
  const emergencyCount = queue.filter((e) => severityLabel(e.priorityScore) === "CRITICAL").length;
  const doctorPerf = {};
  appointments.filter((a) => a.status === "DONE").forEach((a) => {
    const name = a.doctor?.name || "Unknown";
    doctorPerf[name] = (doctorPerf[name] || 0) + 1;
  });

  return (
    <div>
      <header className="page-head" style={{ marginTop: 0 }}>
        <div><div className="eyebrow">Admin</div><h1>Reports</h1></div>
      </header>

      <div className="tab-row">
        {TABS.map((t) => <div key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</div>)}
      </div>

      <div className="panel">
        <h2>{tab} report — hospital summary</h2>
        {!generated ? (
          <button className="submit" onClick={() => setGenerated(true)}>Generate Report</button>
        ) : (
          <>
            <div className="appt-card" style={{ padding: 0, border: "none" }}>
              <div className="row"><span>Patient volume</span><span>{patientVolume}</span></div>
              <div className="row"><span>Average waiting time</span><span>{avgWait} min</span></div>
              <div className="row"><span>Emergency cases (current)</span><span>{emergencyCount}</span></div>
              <div className="row"><span>No-show rate</span><span>Not tracked yet</span></div>
              <div className="row"><span>Departments active</span><span>{new Set(appointments.map((a) => a.doctor?.department?.name)).size}</span></div>
            </div>
            <div className="reg-section-title" style={{ marginTop: 18 }}>Doctor performance (completed visits)</div>
            {Object.entries(doctorPerf).length === 0 ? (
              <div className="empty">No completed visits yet.</div>
            ) : (
              Object.entries(doctorPerf).map(([name, count]) => (
                <div className="row" key={name}><span>{name}</span><span>{count} completed</span></div>
              ))
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button className="submit" style={{ marginTop: 0 }} onClick={() => window.print()}>Download PDF</button>
            </div>
            <div className="hint">"Download PDF" opens your browser's print dialog — choose "Save as PDF" there.</div>
          </>
        )}
      </div>
    </div>
  );
}
