import React, { useState } from "react";
import { registerPatient } from "../api/api";

export default function RegisterPage({ onRegistered, onGoLogin }) {
  const [form, setForm] = useState({
    name: "", dob: "", gender: "",
    mobile: "", email: "", address: "",
    password: "", confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.mobile.trim()) {
      setError("Full name and mobile number are required.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      // Wired to your real backend: POST /api/patients
      const res = await registerPatient({
        name: form.name,
        contact: form.mobile,
        age: form.dob ? ageFromDob(form.dob) : null,
        gender: form.gender || null,
      });
      onRegistered({ name: form.name, email: form.email, patientId: res.data.id });
    } catch (err) {
      setError("Something went wrong — is the backend running on port 8080?");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ maxWidth: 460 }}>
        <div className="auth-logo">
          <div className="mark">🏥</div>
          <h1>Create your account</h1>
          <p>Patient registration</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="reg-section">
            <div className="reg-section-title">Personal Information</div>
            <label>Full name</label>
            <input type="text" value={form.name} onChange={update("name")} placeholder="e.g. Anjali Mehta" />
            <div className="reg-row">
              <div>
                <label>Date of birth</label>
                <input type="text" value={form.dob} onChange={update("dob")} placeholder="DD/MM/YYYY" />
              </div>
              <div>
                <label>Gender</label>
                <select value={form.gender} onChange={update("gender")}>
                  <option value="">Select</option>
                  <option value="F">Female</option>
                  <option value="M">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="reg-section">
            <div className="reg-section-title">Contact Information</div>
            <label>Mobile number</label>
            <input type="text" value={form.mobile} onChange={update("mobile")} placeholder="e.g. 9999999999" />
            <label>Email</label>
            <input type="text" value={form.email} onChange={update("email")} placeholder="you@example.com" />
            <label>Address</label>
            <input type="text" value={form.address} onChange={update("address")} placeholder="Optional" />
          </div>

          <div className="reg-section">
            <div className="reg-section-title">Account Information</div>
            <div className="reg-row">
              <div>
                <label>Password</label>
                <input type="password" value={form.password} onChange={update("password")} placeholder="••••••••" />
              </div>
              <div>
                <label>Confirm password</label>
                <input type="password" value={form.confirmPassword} onChange={update("confirmPassword")} placeholder="••••••••" />
              </div>
            </div>
          </div>

          <button className="submit" type="submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <button className="link-btn" onClick={onGoLogin}>Login</button>
        </div>
      </div>
    </div>
  );
}

function ageFromDob(dobStr) {
  // Expects DD/MM/YYYY, falls back to null if unparsable
  const parts = dobStr.split("/");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y) return null;
  const dob = new Date(y, m - 1, d);
  const diff = Date.now() - dob.getTime();
  return Math.max(Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)), 0);
}
