import React, { useState } from "react";
import "./theme.css";
import Login from "./components/Login";
import StaffView from "./components/StaffView";
import PatientView from "./components/PatientView";
import AdminView from "./components/AdminView";

const ROLE_LABELS = { patient: "Patient", staff: "Staff", admin: "Admin" };

function App() {
  const [page, setPage] = useState("login");
  const [role, setRole] = useState(null);

  const goTo = (newPage, newRole) => {
    setPage(newPage);
    if (newRole) setRole(newRole);
  };

  return (
    <div>
      <div className="topbar">
        <div className="brand">
          <div className="mark">M</div>
          <b>Medi Q · Queue System</b>
        </div>
        <nav>
          {["login", "patient", "staff", "admin"].map((p) => (
            <button
              key={p}
              className={page === p ? "active" : ""}
              onClick={() => goTo(p)}
            >
              {p === "login" ? "Login" : ROLE_LABELS[p]}
            </button>
          ))}
        </nav>
        <div className="whoami">
          {role ? <>Signed in as <b>{ROLE_LABELS[role]}</b></> : "Not signed in"}
        </div>
      </div>

      <div className="wrap">
        {page === "login" && <Login onSelectRole={(r) => goTo(r, r)} />}
        {page === "patient" && <PatientView />}
        {page === "staff" && <StaffView />}
        {page === "admin" && <AdminView />}
      </div>
    </div>
  );
}

export default App;
