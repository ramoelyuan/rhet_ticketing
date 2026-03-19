import { useEffect, useRef } from "react";
import { useAuth } from "./useAuth";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Subscribe to real-time ticket events (SSE).
 * @param {() => void} onNewTicket - Called when a new ticket is created (refetch list).
 * @param {(ticketId: string) => void} [onTicketUpdated] - Called when a ticket is updated (e.g. taken).
 * @param {(payload: any) => void} [onTicketMessage] - Called when a new message/reply is added to a ticket.
 */
export function useTicketEvents(onNewTicket, onTicketUpdated, onTicketMessage) {
  const { user } = useAuth();
  const onNewTicketRef = useRef(onNewTicket);
  const onTicketUpdatedRef = useRef(onTicketUpdated);
  const onTicketMessageRef = useRef(onTicketMessage);
  onNewTicketRef.current = onNewTicket;
  onTicketUpdatedRef.current = onTicketUpdated;
  onTicketMessageRef.current = onTicketMessage;

  useEffect(() => {
    if (!user) return;

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
          if (data.type === "ticket_updated" && data.ticketId && onTicketUpdatedRef.current) {
            onTicketUpdatedRef.current(data.ticketId);
          }
          if (data.type === "ticket_message" && data.ticketId && onTicketMessageRef.current) {
            onTicketMessageRef.current(data);
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
