import React, { useEffect, useState } from "react";
import { getAllWaitLogs } from "../api/api";
import useLiveQueue from "../hooks/useLiveQueue";
import { severityLabel } from "./StaffView";

const TABS = ["Wait-Time Prediction", "No-Show Prediction", "Priority Analysis", "Model Performance"];

export default function AIAnalyticsPage() {
  const { queue } = useLiveQueue();
  const [tab, setTab] = useState("Wait-Time Prediction");
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    getAllWaitLogs().then((res) => setLogs(res.data)).catch(() => {});
  }, [queue.length]);

  const withPrediction = logs.filter((l) => l.predictedWaitMinutes != null && l.actualWaitMinutes != null);
  const avgPredicted = withPrediction.length
    ? Math.round(withPrediction.reduce((s, l) => s + l.predictedWaitMinutes, 0) / withPrediction.length) : null;
  const avgActual = withPrediction.length
    ? Math.round(withPrediction.reduce((s, l) => s + l.actualWaitMinutes, 0) / withPrediction.length) : null;
  const errors = withPrediction.map((l) => Math.abs(l.predictedWaitMinutes - l.actualWaitMinutes));
  const mae = errors.length ? (errors.reduce((s, e) => s + e, 0) / errors.length).toFixed(1) : null;
  const rmse = errors.length ? Math.sqrt(errors.reduce((s, e) => s + e * e, 0) / errors.length).toFixed(1) : null;

  const severityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  queue.forEach((e) => { severityCounts[severityLabel(e.priorityScore)]++; });

  return (
    <div>
      <header className="page-head" style={{ marginTop: 0 }}>
        <div><div className="eyebrow">Admin</div><h1>🤖 AI Analytics</h1></div>
      </header>

      <div className="tab-row">
        {TABS.map((t) => <div key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</div>)}
      </div>

      {tab === "Wait-Time Prediction" && (
        <div className="panel">
          {withPrediction.length === 0 ? (
            <div className="empty">
              No completed visits with a prediction yet. Predictions are captured automatically once a
              patient checks in (backend calls the ML service) and a doctor completes their visit.
            </div>
          ) : (
            <>
              <div className="dash-cards">
                <div className="dash-card"><div className="lbl">Average Predicted Wait</div><div className="val">{avgPredicted} min</div></div>
                <div className="dash-card"><div className="lbl">Average Actual Wait</div><div className="val">{avgActual} min</div></div>
                <div className="dash-card"><div className="lbl">Prediction Error</div><div className="val">{Math.abs(avgPredicted - avgActual)} min</div></div>
              </div>
              <div className="hint">Based on {withPrediction.length} completed visit(s) with both a prediction and an actual outcome recorded.</div>
            </>
          )}
        </div>
      )}

      {tab === "No-Show Prediction" && (
        <div className="panel">
          <div className="empty">
            The ML service exposes a <code>/predict-no-show</code> endpoint, but the app doesn't yet track
            missed appointments (there's no "no-show" status in the Appointment entity). Wiring this up is
            a good next step — see the ml-service README for the heuristic currently used.
          </div>
        </div>
      )}

      {tab === "Priority Analysis" && (
        <div className="panel">
          <h2>Current queue by severity</h2>
          <div className="bar-chart">
            {Object.entries(severityCounts).map(([sev, count]) => (
              <div className="bar-row" key={sev}>
                <span>{sev}</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${(count / Math.max(...Object.values(severityCounts), 1)) * 100}%` }} /></div>
                <span className="bar-value">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "Model Performance" && (
        <div className="panel">
          <div className="reg-section-title">Current Model</div>
          <div className="row"><span>Wait-time model</span><span>Random Forest Regression</span></div>
          <div className="row"><span>No-show model</span><span>Not yet trained (heuristic only)</span></div>
          <div className="row"><span>MAE</span><span>{mae ? `${mae} minutes` : "— (no data yet)"}</span></div>
          <div className="row"><span>RMSE</span><span>{rmse ? `${rmse} minutes` : "— (no data yet)"}</span></div>
          <div className="hint" style={{ marginTop: 14 }}>
            Your synopsis specifies Random Forest as the baseline and XGBoost for production — the ml-service
            currently ships Random Forest (see <code>train_wait_time_model.py</code>). Swapping in XGBoost is
            a drop-in change to that file.
          </div>
        </div>
      )}
    </div>
  );
}
