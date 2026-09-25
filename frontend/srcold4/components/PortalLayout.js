import React from "react";

export default function PortalLayout({ navItems, activePage, onNavigate, user, onLogout, roleLabel }) {
  const initials = (user?.name || roleLabel || "U").trim().charAt(0).toUpperCase();

  return (
    <div className="portal">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="mark">🏥</div>
          <b>AI Smart<br />Hospital</b>
        </div>

        <div className="side-nav">
          {navItems.map((item) => (
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
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>{user?.name || roleLabel}</span>
          </div>
        </div>
        <div className="portal-body">{navItems.find((n) => n.key === activePage)?.content}</div>
      </div>
    </div>
  );
}
