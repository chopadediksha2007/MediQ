import React, { useState } from "react";
import "./theme.css";

import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import PatientLayout from "./components/PatientLayout";
import PatientDashboardPage from "./components/PatientDashboardPage";
import BookAppointmentPage from "./components/BookAppointmentPage";
import QueueListPage from "./components/QueueListPage";
import StaffView from "./components/StaffView";
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

function App() {
  const [screen, setScreen] = useState("login"); // 'login' | 'register' | 'app'
  const [user, setUser] = useState(null); // { name, email, role, patientId }
  const [patientPage, setPatientPage] = useState("dashboard");
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
    return (
      <RegisterPage
        onRegistered={handleRegistered}
        onGoLogin={() => setScreen("login")}
      />
    );
  }

  // Logged in
  if (user?.role === "staff" || user?.role === "receptionist" || user?.role === "doctor") {
    return (
      <div>
        <div className="topbar">
          <div className="brand"><div className="mark">M</div><b>Medi Q · Queue System</b></div>
          <div className="whoami">
            Signed in as <b>{user.role}</b>
            <button className="link-btn" style={{ marginLeft: 14 }} onClick={handleLogout}>Logout</button>
          </div>
        </div>
        <div className="wrap"><StaffView /></div>
      </div>
    );
  }

  if (user?.role === "admin") {
    return (
      <div>
        <div className="topbar">
          <div className="brand"><div className="mark">M</div><b>Medi Q · Queue System</b></div>
          <div className="whoami">
            Signed in as <b>Admin</b>
            <button className="link-btn" style={{ marginLeft: 14 }} onClick={handleLogout}>Logout</button>
          </div>
        </div>
        <div className="wrap"><AdminView /></div>
      </div>
    );
  }

  // Default: patient portal
  return (
    <PatientLayout
      activePage={patientPage}
      onNavigate={setPatientPage}
      user={user}
      onLogout={handleLogout}
    >
      {patientPage === "dashboard" && (
        <PatientDashboardPage myAppointmentId={myAppointmentId} onNavigate={setPatientPage} />
      )}
      {patientPage === "book" && (
        <BookAppointmentPage user={user} onBooked={handleBooked} />
      )}
      {patientPage === "queue" && (
        <QueueListPage myAppointmentId={myAppointmentId} />
      )}
      {["appointments", "prediction", "history", "notifications", "profile", "settings"].includes(patientPage) && (
        <ComingSoon title={patientPage[0].toUpperCase() + patientPage.slice(1)} />
      )}
    </PatientLayout>
  );
}

export default App;
