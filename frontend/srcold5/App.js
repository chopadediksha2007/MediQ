import React, { useState } from "react";
import "./theme.css";

import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import PatientLayout from "./components/PatientLayout";
import PatientDashboardPage from "./components/PatientDashboardPage";
import BookAppointmentPage from "./components/BookAppointmentPage";
import LiveQueuePage from "./components/LiveQueuePage";
import PatientHistoryPage from "./components/PatientHistoryPage";
import NotificationsPage from "./components/NotificationsPage";
import ProfilePage from "./components/ProfilePage";

import PortalLayout from "./components/PortalLayout";
import DoctorDashboardPage from "./components/DoctorDashboardPage";
import TodaysPatientsPage from "./components/TodaysPatientsPage";
import PriorityCasesPage from "./components/PriorityCasesPage";
import DoctorLiveQueuePage from "./components/DoctorLiveQueuePage";
import DoctorAnalyticsPage from "./components/DoctorAnalyticsPage";

import ReceptionistDashboardPage from "./components/ReceptionistDashboardPage";
import EmergencyQueuePage from "./components/EmergencyQueuePage";
import AdminView from "./components/AdminView";

const DEFAULT_DOCTOR_ID = 1; // No real doctor auth yet — see LoginPage.js note

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
  const [doctorPage, setDoctorPage] = useState("dashboard");
  const [receptionistPage, setReceptionistPage] = useState("dashboard");
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
    setDoctorPage("dashboard");
    setReceptionistPage("dashboard");
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

  // ===== Doctor portal =====
  if (user?.role === "doctor") {
    const navItems = [
      { key: "dashboard", label: "Dashboard", icon: "📊", content: <DoctorDashboardPage /> },
      { key: "todays", label: "Today's Patients", icon: "👥", content: <TodaysPatientsPage doctorId={DEFAULT_DOCTOR_ID} /> },
      { key: "queue", label: "Live Queue", icon: "🟢", content: <DoctorLiveQueuePage doctorId={DEFAULT_DOCTOR_ID} /> },
      { key: "priority", label: "Priority Cases", icon: "🚨", content: <PriorityCasesPage /> },
      { key: "history", label: "Patient History", icon: "📋", content: <ComingSoon title="Patient History" /> },
      { key: "analytics", label: "My Analytics", icon: "📈", content: <DoctorAnalyticsPage doctorId={DEFAULT_DOCTOR_ID} /> },
      { key: "notifications", label: "Notifications", icon: "🔔", content: <ComingSoon title="Notifications" /> },
      { key: "profile", label: "Profile", icon: "👤", content: <ComingSoon title="Profile" /> },
    ];
    return (
      <PortalLayout navItems={navItems} activePage={doctorPage} onNavigate={setDoctorPage} user={user} onLogout={handleLogout} roleLabel="Doctor" />
    );
  }

  // ===== Receptionist portal =====
  if (user?.role === "receptionist" || user?.role === "staff") {
    const navItems = [
      { key: "dashboard", label: "Dashboard", icon: "📊", content: <ReceptionistDashboardPage /> },
      { key: "register", label: "Register Patient", icon: "👤", content: <ReceptionistDashboardPage /> },
      { key: "appointments", label: "Appointments", icon: "📅", content: <ComingSoon title="Appointments" /> },
      { key: "queue", label: "Live Queue", icon: "🟢", content: <LiveQueuePage myAppointmentId={null} /> },
      { key: "emergency", label: "Emergency", icon: "🚨", content: <EmergencyQueuePage /> },
      { key: "patients", label: "Patients", icon: "👥", content: <ComingSoon title="Patients" /> },
      { key: "notifications", label: "Notifications", icon: "🔔", content: <ComingSoon title="Notifications" /> },
    ];
    return (
      <PortalLayout navItems={navItems} activePage={receptionistPage} onNavigate={setReceptionistPage} user={user} onLogout={handleLogout} roleLabel="Receptionist" />
    );
  }

  // ===== Admin =====
  if (user?.role === "admin") {
    return (
      <div>
        <div className="topbar">
          <div className="brand"><div className="mark">M</div><b>Medi Q · Queue System</b></div>
          <div className="whoami">Signed in as <b>Admin</b><button className="link-btn" style={{ marginLeft: 14 }} onClick={handleLogout}>Logout</button></div>
        </div>
        <div className="wrap"><AdminView /></div>
      </div>
    );
  }

  // ===== Default: Patient portal =====
  return (
    <PatientLayout activePage={patientPage} onNavigate={setPatientPage} user={user} onLogout={handleLogout}>
      {patientPage === "dashboard" && <PatientDashboardPage myAppointmentId={myAppointmentId} onNavigate={setPatientPage} />}
      {patientPage === "book" && <BookAppointmentPage user={user} onBooked={handleBooked} />}
      {patientPage === "queue" && <LiveQueuePage myAppointmentId={myAppointmentId} />}
      {patientPage === "history" && <PatientHistoryPage patientId={user?.patientId} />}
      {patientPage === "notifications" && <NotificationsPage myAppointmentId={myAppointmentId} />}
      {patientPage === "profile" && <ProfilePage user={user} patientId={user?.patientId} />}
      {["appointments", "prediction", "settings"].includes(patientPage) && (
        <ComingSoon title={patientPage[0].toUpperCase() + patientPage.slice(1)} />
      )}
    </PatientLayout>
  );
}

export default App;
