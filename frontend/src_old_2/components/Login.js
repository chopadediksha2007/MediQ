import React from "react";

export default function Login({ onSelectRole }) {
  return (
    <section>
      <header className="page-head">
        <div>
          <div className="eyebrow">Medi Q</div>
          <h1>Sign in</h1>
        </div>
      </header>
      <div className="panel">
        <h2>Choose how you're using the system</h2>
        <div className="role-grid">
          <div className="role-card" onClick={() => onSelectRole("patient")}>
            <div className="ico">🧑</div>
            <b>Patient</b>
            <span>Check your wait status</span>
          </div>
          <div className="role-card" onClick={() => onSelectRole("staff")}>
            <div className="ico">🩺</div>
            <b>Receptionist / Staff</b>
            <span>Check patients in, manage the live queue</span>
          </div>
          <div className="role-card" onClick={() => onSelectRole("admin")}>
            <div className="ico">📊</div>
            <b>Admin</b>
            <span>View analytics and hospital-wide reports</span>
          </div>
        </div>
        <div className="hint">
          A future version would authenticate this against Spring Security + JWT. For now, pick a role to continue.
        </div>
      </div>
    </section>
  );
}
