/**
 * Server-Sent Events for real-time notifications to IT Support (technicians + admin).
 * When a new ticket is created, we broadcast so they can refetch without refreshing.
 */

const clients = new Set();

function sendTo(entry, data) {
  entry.res.write(`data: ${data}\n\n`);
  entry.res.flush?.();
}

function sendToUserIds(userIds, payload) {
  if (!Array.isArray(userIds) || userIds.length === 0) return;
  const targets = new Set(userIds.filter(Boolean));
  const data = JSON.stringify(payload);
  for (const entry of clients) {
    if (!entry?.user?.id) continue;
    if (!targets.has(entry.user.id)) continue;
    try {
      sendTo(entry, data);
    } catch {
      // client may have disconnected
    }
  }
}

function addClient(res, user) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const entry = { res, user };
  clients.add(entry);

  res.on("close", () => {
    clients.delete(entry);
  });
}

function removeClient(res) {
  for (const entry of clients) {
    if (entry.res === res) {
      clients.delete(entry);
      break;
    }
  }
}

function broadcastNewTicket() {
  const data = JSON.stringify({ type: "new_ticket" });
  for (const entry of clients) {
    if (entry?.user?.role === "EMPLOYEE") continue;
    try {
      sendTo(entry, data);
    } catch {
      // client may have disconnected
    }
  }
}

function broadcastTicketUpdated(ticketId) {
  const data = JSON.stringify({ type: "ticket_updated", ticketId });
  for (const entry of clients) {
    if (entry?.user?.role === "EMPLOYEE") continue;
    try {
      sendTo(entry, data);
    } catch {
      // client may have disconnected
    }
  }
}

function broadcastTicketMessage({ ticketId, ticketNumber, fromUserId, fromName, messagePreview, recipients }) {
  sendToUserIds(recipients, {
    type: "ticket_message",
    ticketId,
    ticketNumber,
    fromUserId,
    fromName,
    messagePreview,
  });
}

module.exports = {
  addClient,
  removeClient,
  broadcastNewTicket,
  broadcastTicketUpdated,
  broadcastTicketMessage,
};
