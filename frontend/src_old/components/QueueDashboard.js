import React, { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getLiveQueue } from "../api/api";

const severityColor = {
  100: "#d32f2f", // critical - red
  50: "#f57c00",  // high - orange
  10: "#fbc02d",  // medium - yellow
  1: "#388e3c",   // low - green
};

export default function QueueDashboard() {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    // Initial load
    getLiveQueue().then((res) => setQueue(res.data));

    // Live updates via WebSocket
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      onConnect: () => {
        client.subscribe("/topic/queue-updates", (message) => {
          setQueue(JSON.parse(message.body));
        });
      },
    });
    client.activate();

    return () => client.deactivate();
  }, []);

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
      <h2>Medi Q — Live Patient Queue</h2>
      {queue.length === 0 && <p>No patients currently in queue.</p>}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={cellStyle}>Position</th>
            <th style={cellStyle}>Patient</th>
            <th style={cellStyle}>Doctor</th>
            <th style={cellStyle}>Priority</th>
            <th style={cellStyle}>Waiting Since</th>
          </tr>
        </thead>
        <tbody>
          {queue.map((entry, idx) => (
            <tr key={entry.id}>
              <td style={cellStyle}>{idx + 1}</td>
              <td style={cellStyle}>{entry.appointment?.patient?.name || "—"}</td>
              <td style={cellStyle}>{entry.appointment?.doctor?.name || "—"}</td>
              <td style={{ ...cellStyle, color: severityColor[entry.priorityScore] || "#333" }}>
                {entry.priorityScore >= 100 ? "CRITICAL" :
                 entry.priorityScore >= 50 ? "HIGH" :
                 entry.priorityScore >= 10 ? "MEDIUM" : "LOW"}
              </td>
              <td style={cellStyle}>{new Date(entry.entryTime).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const cellStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "left",
};
