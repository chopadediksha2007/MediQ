import React from "react";
import useLiveQueue from "../hooks/useLiveQueue";
import { severityLabel } from "./StaffView";

function predictWait(idxAhead, avgConsult, sevScore) {
  const base = idxAhead * avgConsult * 0.5;
  const reduction = sevScore * 0.8;
  return Math.max(Math.round(base - reduction), 2);
}

export default function NotificationsPage({ myAppointmentId }) {
  const { queue } = useLiveQueue();
  const myIndex = queue.findIndex((e) => e.appointment?.id === myAppointmentId);
  const myEntry = myIndex >= 0 ? queue[myIndex] : null;

  const notifications = [];

  if (myEntry) {
    const wait = predictWait(myIndex, 15, myEntry.priorityScore);
    if (myEntry.appointment?.status === "IN_PROGRESS") {
      notifications.push({ dot: "🔴", type: "Important", title: "It's your turn", body: "The doctor is ready to see you now." });
    } else if (myIndex <= 2) {
      notifications.push({
        dot: "🟢", type: "Appointment",
        title: "Your appointment is approaching.",
        body: `Patients ahead: ${myIndex}. Estimated wait: ${wait} minutes.`,
      });
    }
    notifications.push({
      dot: "🔵", type: "Queue Updates",
      title: "Queue position updated",
      body: `You're currently #${myIndex + 1} in line for ${myEntry.appointment?.doctor?.name}.`,
    });
    if (severityLabel(myEntry.priorityScore) === "CRITICAL") {
      notifications.push({ dot: "🔴", type: "Important", title: "Marked as critical priority", body: "You've been moved to the front of the queue." });
    }
  }

  return (
    <div>
      <header className="page-head" style={{ marginTop: 0 }}>
        <div>
          <div className="eyebrow">Notifications</div>
          <h1>Notifications</h1>
        </div>
      </header>

      <div className="panel">
        {notifications.length === 0 ? (
          <div className="empty">No notifications right now — check in for an appointment to get live updates.</div>
        ) : (
          notifications.map((n, i) => (
            <div className="notif-item" key={i}>
              <div className="notif-dot">{n.dot}</div>
              <div className="notif-body">
                <b>{n.title}</b>
                <span>{n.body}</span>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="hint" style={{ marginTop: 12 }}>
        These update live as your queue position changes — no refresh needed. A production version would also push these via SMS/email.
      </div>
    </div>
  );
}
