import { useEffect, useRef } from "react";
import { useAuth } from "./useAuth";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Subscribe to real-time new-ticket events (SSE). When an employee creates a ticket,
 * IT Support receives the event and can refetch the ticket list without refreshing.
 * Only active for TECHNICIAN and ADMIN.
 * @param {() => void} onNewTicket - Called when a new ticket is created (refetch list).
 */
export function useTicketEvents(onNewTicket) {
  const { user } = useAuth();
  const onNewTicketRef = useRef(onNewTicket);
  onNewTicketRef.current = onNewTicket;

  useEffect(() => {
    if (!user || (user.role !== "TECHNICIAN" && user.role !== "ADMIN")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const url = `${API_BASE}/api/events?token=${encodeURIComponent(token)}`;
    let eventSource = null;

    try {
      eventSource = new EventSource(url);

      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data || "{}");
          if (data.type === "new_ticket" && onNewTicketRef.current) {
            onNewTicketRef.current();
          }
        } catch {
          // ignore parse errors
        }
      };

      eventSource.onerror = () => {
        eventSource?.close();
        eventSource = null;
      };
    } catch {
      // EventSource not supported or failed to connect
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [user?.id, user?.role]);
}
