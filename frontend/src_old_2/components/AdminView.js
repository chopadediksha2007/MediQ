import React, { useState } from "react";
import useLiveQueue from "../hooks/useLiveQueue";
import { severityLabel } from "./StaffView";

const DEPT_BASE = { "Dr. Sharma": 14, "Dr. Iyer": 22, "Dr. Rao": 9 };
const HOUR_DATA = [
  ["8am", 2], ["9am", 4], ["10am", 7], ["11am", 9],
  ["12pm", 6], ["1pm", 3], ["2pm", 5], ["3pm", 8], ["4pm", 4],
];

export default function AdminView() {
  const { queue } = useLiveQueue();
  const [clock, setClock] = useState(new Date());

  React.useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const criticalCount = queue.filter((e) => severityLabel(e.priorityScore) === "CRITICAL").length;

  const deptCounts = {};
  queue.forEach((e) => {
    const doc = e.appointment?.doctor?.name;
    if (doc) deptCounts[doc] = (deptCounts[doc] || 0) + 1;
  });
  const deptRows = Object.keys(DEPT_BASE).map((doc) => ({
    doc,
    value: DEPT_BASE[doc] + (deptCounts[doc] || 0) * 2,
  }));
  const maxDeptValue = Math.max(...deptRows.map((d) => d.value), 1);
  const maxHourValue = Math.max(...HOUR_DATA.map((h) => h[1]), 1);

  return (
    <section>
      <header className="page-head">
        <div>
          <div className="eyebrow">Admin view</div>
          <h1>Analytics</h1>
        </div>
        <div className="clock"><span>Local time</span><b>{clock.toLocaleTimeString()}</b></div>
      </header>

      <div className="stat-grid">
        <div className="stat"><div className="n">{queue.length}</div><div className="l">Patients in queue now</div></div>
        <div className="stat"><div className="n">{criticalCount}</div><div className="l">Critical cases now</div></div>
        <div className="stat"><div className="n">3</div><div className="l">Doctors on duty</div></div>
        <div className="stat"><div className="n">3</div><div className="l">Departments active</div></div>
      </div>

      <div className="grid">
        <div className="panel">
          <h2>Avg wait by doctor (est.)</h2>
          <div className="bar-chart">
            {deptRows.map((d) => (
              <div className="bar-row" key={d.doc}>
                <span>{d.doc}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(d.value / maxDeptValue) * 100}%` }} />
                </div>
                <span className="bar-value">{d.value}m</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>Patients checked in by hour (sample)</h2>
          <div className="bar-chart">
            {HOUR_DATA.map(([hour, count]) => (
              <div className="bar-row" key={hour}>
                <span>{hour}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(count / maxHourValue) * 100}%`, background: "var(--medium)" }} />
                </div>
                <span className="bar-value">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
