import React, { useState } from "react";

const TABS = ["Account", "Notifications", "Security", "System Settings"];

export default function SettingsPage({ user }) {
  const [tab, setTab] = useState("Account");

  return (
    <div>
      <header className="page-head" style={{ marginTop: 0 }}>
        <div><div className="eyebrow">Admin</div><h1>Settings</h1></div>
      </header>

      <div className="tab-row">
        {TABS.map((t) => <div key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</div>)}
      </div>

      <div className="panel" style={{ maxWidth: 460 }}>
        {tab === "Account" && (
          <div className="appt-card" style={{ padding: 0, border: "none" }}>
            <div className="row"><span>Email</span><span>{user?.email || "—"}</span></div>
            <div className="row"><span>Role</span><span>Admin</span></div>
          </div>
        )}
        {tab === "Notifications" && (
          <>
            <label>Notify on new emergency case</label>
            <select defaultValue="on"><option value="on">On</option><option value="off">Off</option></select>
            <label>Notify on surge detection</label>
            <select defaultValue="on"><option value="on">On</option><option value="off">Off</option></select>
          </>
        )}
        {tab === "Security" && (
          <p style={{ fontSize: 13.5, color: "var(--muted)" }}>
            No real authentication is wired up yet — placeholder for when Spring Security + JWT is added.
          </p>
        )}
        {tab === "System Settings" && (
          <>
            <label>Hospital name</label>
            <input type="text" defaultValue="General Hospital" />
            <label>Queue re-check interval (seconds)</label>
            <input type="text" defaultValue="30" />
            <div className="hint">Not persisted anywhere yet — would need a Settings table + endpoint.</div>
          </>
        )}
      </div>
    </div>
  );
}
