import React, { useEffect, useState } from "react";
import useLiveQueue from "../hooks/useLiveQueue";
import { severityLabel } from "./StaffView";
import { getAppointmentsForDoctor } from "../api/api";

const TABS = ["All", "Waiting", "Consulting", "Completed"];

export default function TodaysPatientsPage({ doctorId }) {
  const { queue } = useLiveQueue();
  const [tab, setTab] = useState("All");
  const [allAppointments, setAllAppointments] = useState([]);

  useEffect(() => {
    getAppointmentsForDoctor(doctorId).then((res) => setAllAppointments(res.data)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, queue.length]);

  const doctorQueue = queue.filter((e) => e.appointment?.doctor?.id === doctorId);
  const completedList = allAppointments.filter((a) => a.status === "DONE");

  const rows = [
    ...doctorQueue.map((e) => ({
      patient: `P${e.appointment?.id}`,
      time: e.appointment?.scheduledTime ? new Date(e.appointment.scheduledTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—",
      priority: severityLabel(e.priorityScore),
      wait: `${Math.round((Date.now() - new Date(e.entryTime).getTime()) / 60000)}m`,
      status: e.appointment?.status === "IN_PROGRESS" ? "Consulting" : "Waiting",
    })),
    ...completedList.map((a) => ({
      patient: `P${a.id}`,
      time: a.scheduledTime ? new Date(a.scheduledTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—",
      priority: "—",
      wait: a.predictedWaitMinutes != null ? `${a.predictedWaitMinutes}m` : "—",
      status: "Completed",
    })),
  ];

  const filtered = tab === "All" ? rows : rows.filter((r) => r.status === tab);

  return (
    <div>
      <header className="page-head" style={{ marginTop: 0 }}>
        <div>
          <div className="eyebrow">Today</div>
          <h1>Today's Patients</h1>
        </div>
      </header>

      <div className="tab-row">
        {TABS.map((t) => (
          <div key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>

      <div className="panel">
        {filtered.length === 0 ? (
          <div className="empty">No patients in this category.</div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Patient</th><th>Appointment</th><th>Priority</th><th>Wait</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i}>
                  <td>{r.patient}</td>
                  <td>{r.time}</td>
                  <td>{r.priority}</td>
                  <td>{r.wait}</td>
                  <td><span className={`status-chip ${r.status}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
