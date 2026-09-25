import React, { useEffect, useState } from "react";
import { getDepartments, getAllAppointments } from "../api/api";

export default function DepartmentManagementPage() {
  const [departments, setDepartments] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    getDepartments().then((res) => setDepartments(res.data)).catch(() => {});
    getAllAppointments().then((res) => setAppointments(res.data)).catch(() => {});
  }, []);

  const counts = departments.map((d) => ({
    name: d.name,
    count: appointments.filter((a) => a.doctor?.department?.id === d.id).length,
  }));
  const maxCount = Math.max(...counts.map((c) => c.count), 1);

  return (
    <div>
      <header className="page-head" style={{ marginTop: 0 }}>
        <div><div className="eyebrow">Admin</div><h1>Departments</h1></div>
      </header>

      <div className="panel">
        {counts.length === 0 ? (
          <div className="empty">No departments found.</div>
        ) : (
          <div className="bar-chart">
            {counts.map((c) => (
              <div className="bar-row" key={c.name}>
                <span>{c.name}</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${(c.count / maxCount) * 100}%` }} /></div>
                <span className="bar-value">{c.count} patients</span>
              </div>
            ))}
          </div>
        )}
        <button className="submit" style={{ marginTop: 18 }} disabled>+ Add Department</button>
        <div className="hint">Not wired up yet — would call a new <code>POST /api/departments</code> endpoint.</div>
      </div>
    </div>
  );
}
