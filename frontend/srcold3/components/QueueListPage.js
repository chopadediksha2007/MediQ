import React from "react";
import useLiveQueue from "../hooks/useLiveQueue";
import { severityLabel } from "./StaffView";

export default function QueueListPage({ myAppointmentId }) {
  const { queue } = useLiveQueue();

  return (
    <div>
      <header className="page-head" style={{ marginTop: 0 }}>
        <div>
          <div className="eyebrow">Live Queue</div>
          <h1>Everyone waiting right now</h1>
        </div>
      </header>

      <div className="panel">
        <div className="queue-list">
          {queue.length === 0 && <div className="empty">No one is currently in the queue.</div>}
          {queue.map((entry, idx) => {
            const isMe = entry.appointment?.id === myAppointmentId;
            return (
              <div className="row" key={entry.id} style={isMe ? { borderColor: "var(--teal)", background: "#F0F7F6" } : {}}>
                <div className="pos">{idx + 1}</div>
                <div className="who">
                  <b>{entry.appointment?.patient?.name || "—"}{isMe ? " (You)" : ""}</b>
                  <span>{entry.appointment?.doctor?.name || "—"}</span>
                </div>
                <div className={`tag ${severityLabel(entry.priorityScore)}`}>{severityLabel(entry.priorityScore)}</div>
                <div className="wait">
                  <b>{new Date(entry.entryTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</b>
                  <span>checked in</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
