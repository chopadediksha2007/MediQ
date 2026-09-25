import React, { useEffect, useState } from "react";
import { api } from "../api/api";

const TABS = [
  { key: "personal", label: "Personal Information" },
  { key: "contact", label: "Contact" },
  { key: "security", label: "Security" },
];

export default function ProfilePage({ user, patientId }) {
  const [tab, setTab] = useState("personal");
  const [patient, setPatient] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    api.get(`/patients/${patientId}`).then((res) => setPatient(res.data)).catch(() => {});
  }, [patientId]);

  return (
    <div>
      <header className="page-head" style={{ marginTop: 0 }}>
        <div>
          <div className="eyebrow">Profile</div>
          <h1>My Profile</h1>
        </div>
      </header>

      <div className="tab-row">
        {TABS.map((t) => (
          <div key={t.key} className={`tab-btn ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>
            {t.label}
          </div>
        ))}
      </div>

      <div className="panel" style={{ maxWidth: 460 }}>
        {tab === "personal" && (
          <>
            <div className="appt-card" style={{ padding: 0, border: "none" }}>
              <div className="row"><span>Name</span><span>{patient?.name || user?.name || "—"}</span></div>
              <div className="row"><span>Date of birth</span><span>{patient?.age ? `~${patient.age} yrs` : "—"}</span></div>
              <div className="row"><span>Gender</span><span>{patient?.gender || "—"}</span></div>
            </div>
            <button className="submit" style={{ marginTop: 16 }} onClick={() => setEditing((v) => !v)}>
              {editing ? "Editing (not yet saved — hook up PUT /api/patients/{id})" : "Edit Profile"}
            </button>
          </>
        )}

        {tab === "contact" && (
          <div className="appt-card" style={{ padding: 0, border: "none" }}>
            <div className="row"><span>Email</span><span>{user?.email || "—"}</span></div>
            <div className="row"><span>Mobile</span><span>{patient?.contact || "—"}</span></div>
            <div className="row"><span>Address</span><span>—</span></div>
          </div>
        )}

        {tab === "security" && (
          <>
            <p style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 0 }}>
              No real authentication is wired up yet (see LoginPage.js) — this is a placeholder for when Spring Security is added.
            </p>
            <button className="submit" disabled>Change Password</button>
          </>
        )}
      </div>
    </div>
  );
}
