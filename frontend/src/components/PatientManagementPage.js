import React, { useEffect, useState } from "react";
import { getPatients, getAllAppointments } from "../api/api";
import useLiveQueue from "../hooks/useLiveQueue";
import { severityLabel } from "./StaffView";

const TABS = ["All Patients", "Active", "Emergency", "History"];

export default function PatientManagementPage() {
  const { queue } = useLiveQueue();
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState("All Patients");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getPatients().then((res) => setPatients(res.data)).catch(() => {});
    getAllAppointments().then((res) => setAppointments(res.data)).catch(() => {});
  }, [queue.length]);

  const rows = patients.map((p) => {
    const patientAppointments = appointments.filter((a) => a.patient?.id === p.id);
    const latest = patientAppointments[patientAppointments.length - 1];
    const queueEntry = queue.find((e) => e.appointment?.patient?.id === p.id);
    let status = "Registered";
    if (queueEntry) status = severityLabel(queueEntry.priorityScore) === "CRITICAL" ? "Emergency" : "Active";
    else if (patientAppointments.some((a) => a.status === "DONE")) status = "History";

    return {
      id: p.id,
      name: p.name,
      department: latest?.doctor?.department?.name || "—",
      status,
    };
  });

  const filtered = tab === "All Patients" ? rows : rows.filter((r) => {
    if (tab === "Active") return r.status === "Active" || r.status === "Emergency";
    if (tab === "Emergency") return r.status === "Emergency";
    if (tab === "History") return r.status === "History";
    return true;
  });

  return (
    <div>
      <header className="page-head" style={{ marginTop: 0 }}>
        <div><div className="eyebrow">Admin</div><h1>Patient Management</h1></div>
      </header>

      <div className="tab-row">
        {TABS.map((t) => <div key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</div>)}
      </div>

      <div className="panel">
        {filtered.length === 0 ? (
          <div className="empty">No patients in this category.</div>
        ) : (
          <table className="data-table">
            <thead><tr><th>ID</th><th>Name</th><th>Department</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>P{r.id}</td>
                  <td>{r.name}</td>
                  <td>{r.department}</td>
                  <td><span className={`status-chip ${r.status === "History" ? "Completed" : r.status === "Active" || r.status === "Emergency" ? "Waiting" : ""}`}>{r.status}</span></td>
                  <td><button className="link-btn" onClick={() => setSelected(r)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {selected && (
          <div className="priority-detail">
            <div className="reg-section-title">P{selected.id} — {selected.name}</div>
            <div className="row"><span>Department</span><span>{selected.department}</span></div>
            <div className="row"><span>Status</span><span>{selected.status}</span></div>
          </div>
        )}
      </div>
    </div>
  );
}
