import React from "react";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "📊" },
  { key: "appointments", label: "Appointments", icon: "📅" },
  { key: "book", label: "Book Appointment", icon: "➕" },
  { key: "queue", label: "Live Queue", icon: "🟢" },
  { key: "prediction", label: "AI Prediction", icon: "🤖" },
  { key: "history", label: "History", icon: "📋" },
  { key: "notifications", label: "Notifications", icon: "🔔" },
  { key: "profile", label: "My Profile", icon: "👤" },
  { key: "settings", label: "Settings", icon: "⚙️" },
];

export default function PatientLayout({ activePage, onNavigate, user, onLogout, children }) {
  const initials = (user?.name || "P").trim().charAt(0).toUpperCase();

  return (
    <div className="portal">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="mark">🏥</div>
          <b>AI Smart<br />Hospital</b>
        </div>

        <div className="side-nav">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.key}
              className={`side-link ${activePage === item.key ? "active" : ""}`}
              onClick={() => onNavigate(item.key)}
            >
              <span className="ic">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="side-logout">
          <div className="side-link" onClick={onLogout}>
            <span className="ic">🚪</span>
            <span>Logout</span>
          </div>
        </div>
      </aside>

      <div className="portal-main">
        <div className="portal-topbar">
          <input className="portal-search" type="text" placeholder="Search" />
          <div className="portal-user">
            <span style={{ fontSize: 16 }}>🔔</span>
            <div className="portal-avatar">{initials}</div>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>{user?.name || "Patient"}</span>
          </div>
        </div>
        <div className="portal-body">{children}</div>
      </div>
    </div>
  );
}
