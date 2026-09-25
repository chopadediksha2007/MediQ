import React, { useState } from "react";

// NOTE: There is no real authentication backend yet (no Spring Security / JWT).
// This screen collects email + password and a role choice, and simulates login
// so the rest of the app can be built and demoed. Wire this up to a real
// /api/auth/login endpoint later — see the "Suggested Next Steps" in the README.
export default function LoginPage({ onLogin, onGoRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("patient");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password.");
      return;
    }
    setError("");
    // Real version: call /api/auth/login, get back { role, token }, then route by role.
    onLogin({ email, role });
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="mark">🏥</div>
          <h1>AI Smart Hospital</h1>
          <p>Intelligent Queue Management</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>I am a</label>
          <div className="role-pills">
            {[
              { key: "patient", label: "Patient" },
              { key: "doctor", label: "Doctor" },
              { key: "receptionist", label: "Receptionist" },
              { key: "admin", label: "Admin" },
            ].map((r) => (
              <div
                key={r.key}
                className={`role-pill ${role === r.key ? "active" : ""}`}
                onClick={() => setRole(r.key)}
              >
                {r.label}
              </div>
            ))}
          </div>

          <label>Email</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <label>Password</label>
          <div className="field-wrap">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="eye-toggle"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="auth-links">
            <a href="#!" onClick={(e) => e.preventDefault()}>Forgot password?</a>
          </div>

          <button className="submit" type="submit">Login</button>
        </form>

        <div className="auth-footer">
          Don't have an account?{" "}
          <button className="link-btn" onClick={onGoRegister}>Register</button>
        </div>
      </div>
    </div>
  );
}
