import React, { useEffect, useState } from "react";
import { getDoctors } from "../api/api";
import useLiveQueue from "../hooks/useLiveQueue";

const TABS = ["All Doctors", "Available", "On Leave"];

export default function DoctorManagementPage() {
  const { queue } = useLiveQueue();
  const [doctors, setDoctors] = useState([]);
  const [tab, setTab] = useState("All Doctors");

  useEffect(() => {
    getDoctors().then((res) => setDoctors(res.data)).catch(() => {});
  }, []);

  const rows = doctors.map((d) => {
    const currentPatients = queue.filter((e) => e.appointment?.doctor?.id === d.id).length;
    return {
      id: d.id,
      name: d.name,
      department: d.department?.name || "—",
      avgTime: d.avgConsultationTime,
      patients: currentPatients,
      status: "Available", // No real leave-tracking yet — every seeded doctor shows Available
    };
  });

  const filtered = tab === "All Doctors" ? rows : rows.filter((r) => r.status === tab.replace("On Leave", "On Leave"));

  return (
    <div>
      <header className="page-head" style={{ marginTop: 0 }}>
        <div><div className="eyebrow">Admin</div><h1>Doctor Management</h1></div>
      </header>

      <div className="tab-row">
        {TABS.map((t) => <div key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</div>)}
      </div>

      <div className="panel">
        {filtered.length === 0 ? (
          <div className="empty">{tab === "On Leave" ? "No doctors on leave — leave-tracking isn't wired up yet." : "No doctors found."}</div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Doctor</th><th>Department</th><th>Avg Time</th><th>Patients</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.department}</td>
                  <td>{r.avgTime} min</td>
                  <td>{r.patients}</td>
                  <td><span className="status-chip Completed">{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="hint" style={{ marginTop: 12 }}>Avg consultation time here directly feeds the wait-time ML model's <code>doctor_avg_consult_time</code> feature.</div>
    </div>
  );
}
