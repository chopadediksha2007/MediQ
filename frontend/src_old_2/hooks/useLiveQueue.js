import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getLiveQueue } from "../api/api";

// Shared hook: keeps the live queue in sync via WebSocket.
// Used by StaffView, PatientView, and AdminView so they all see the same data.
export default function useLiveQueue() {
  const [queue, setQueue] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    getLiveQueue().then((res) => setQueue(res.data)).catch(() => {});

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      onConnect: () => {
        setConnected(true);
        client.subscribe("/topic/queue-updates", (message) => {
          setQueue(JSON.parse(message.body));
        });
      },
      onDisconnect: () => setConnected(false),
    });
    client.activate();

    return () => client.deactivate();
  }, []);

  return { queue, connected };
}
