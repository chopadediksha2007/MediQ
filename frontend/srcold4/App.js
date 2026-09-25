import React, { useState } from "react";
import "./theme.css";

import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import PatientLayout from "./components/PatientLayout";
import PatientDashboardPage from "./components/PatientDashboardPage";
import BookAppointmentPage from "./components/BookAppointmentPage";
import LiveQueuePage from "./components/LiveQueuePage";
import DoctorDashboardPage from "./components/DoctorDashboardPage";
import ReceptionistDashboardPage from "./components/ReceptionistDashboardPage";
import EmergencyQueuePage from "./components/EmergencyQueuePage";
import AdminView from "./components/AdminView";

function ComingSoon({ title }) {
  return (
    <div>
      <header className="page-head" style={{ marginTop: 0 }}>
        <div>
          <div className="eyebrow">Coming soon</div>
          <h1>{title}</h1>
        </div>
      </header>
      <div className="coming-soon">This page hasn't been built yet — tell Claude which one to add next.</div>
    </div>
  );
}

function StaffTopbar({ label, onLogout, children }) {
  return (
    <div>
      <div className="topbar">
        <div className="brand"><div className="mark">M</div><b>Medi Q · Queue System</b></div>
        <div className="whoami">
          Signed in as <b>{label}</b>
          <button className="link-btn" style={{ marginLeft: 14 }} onClick={onLogout}>Logout</button>
        </div>
      </div>
      <div className="wrap">{children}</div>
    </div>
  );
}

function App() {
  const [screen, setScreen] = useState("login"); // 'login' | 'register' | 'app'
  const [user, setUser] = useState(null); // { name, email, role, patientId }
  const [patientPage, setPatientPage] = useState("dashboard");
  const [staffPage, setStaffPage] = useState("dashboard"); // 'dashboard' | 'emergency'
  const [myAppointmentId, setMyAppointmentId] = useState(null);

  const handleLogin = ({ email, role }) => {
    setUser({ email, role, name: email.split("@")[0], patientId: null });
    setScreen("app");
  };

  const handleRegistered = ({ name, email, patientId }) => {
    setUser({ name, email, role: "patient", patientId });
    setPatientPage("dashboard");
    setScreen("app");
  };

  const handleLogout = () => {
    setUser(null);
    setMyAppointmentId(null);
    setPatientPage("dashboard");
    setStaffPage("dashboard");
    setScreen("login");
  };

  const handleBooked = ({ patientId, appointmentId }) => {
    setUser((u) => ({ ...u, patientId }));
    setMyAppointmentId(appointmentId);
    setPatientPage("dashboard");
  };

  if (screen === "login") {
    return <LoginPage onLogin={handleLogin} onGoRegister={() => setScreen("register")} />;
  }
  if (screen === "register") {
    return <RegisterPage onRegistered={handleRegistered} onGoLogin={() => setScreen("login")} />;
  }

  // Doctor
  if (user?.role === "doctor") {
    return (
      <StaffTopbar label="Doctor" onLogout={handleLogout}>
        <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
          <button className={`sev-btn ${staffPage === "dashboard" ? "active" : ""}`} data-sev="MEDIUM" style={{ flex: "none", padding: "8px 16px" }} onClick={() => setStaffPage("dashboard")}>Dashboard</button>
          <button className={`sev-btn ${staffPage === "emergency" ? "active" : ""}`} data-sev="CRITICAL" style={{ flex: "none", padding: "8px 16px" }} onClick={() => setStaffPage("emergency")}>Emergency Queue</button>
        </div>
        {staffPage === "dashboard" ? <DoctorDashboardPage /> : <EmergencyQueuePage />}
      </StaffTopbar>
    );
  }

  // Receptionist
  if (user?.role === "receptionist" || user?.role === "staff") {
    return (
      <StaffTopbar label="Receptionist" onLogout={handleLogout}>
        <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
          <button className={`sev-btn ${staffPage === "dashboard" ? "active" : ""}`} data-sev="MEDIUM" style={{ flex: "none", padding: "8px 16px" }} onClick={() => setStaffPage("dashboard")}>Dashboard</button>
          <button className={`sev-btn ${staffPage === "emergency" ? "active" : ""}`} data-sev="CRITICAL" style={{ flex: "none", padding: "8px 16px" }} onClick={() => setStaffPage("emergency")}>Emergency Queue</button>
        </div>
        {staffPage === "dashboard" ? <ReceptionistDashboardPage /> : <EmergencyQueuePage />}
      </StaffTopbar>
    );
  }

  // Admin
  if (user?.role === "admin") {
    return (
      <StaffTopbar label="Admin" onLogout={handleLogout}>
        <AdminView />
      </StaffTopbar>
    );
  }

  // Default: patient portal
  return (
    <PatientLayout activePage={patientPage} onNavigate={setPatientPage} user={user} onLogout={handleLogout}>
      {patientPage === "dashboard" && (
        <PatientDashboardPage myAppointmentId={myAppointmentId} onNavigate={setPatientPage} />
      )}
      {patientPage === "book" && (
        <BookAppointmentPage user={user} onBooked={handleBooked} />
      )}
      {patientPage === "queue" && (
        <LiveQueuePage myAppointmentId={myAppointmentId} />
      )}
      {["appointments", "prediction", "history", "notifications", "profile", "settings"].includes(patientPage) && (
        <ComingSoon title={patientPage[0].toUpperCase() + patientPage.slice(1)} />
      )}
    </PatientLayout>
  );
}

export default App;
