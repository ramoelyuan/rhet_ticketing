/**
 * Server-Sent Events for real-time notifications to IT Support (technicians + admin).
 * When a new ticket is created, we broadcast so they can refetch without refreshing.
 */

const clients = new Set();

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
  for (const { res } of clients) {
    try {
      res.write(`data: ${data}\n\n`);
      res.flush?.();
    } catch {
      // client may have disconnected
    }
  }
}

module.exports = { addClient, removeClient, broadcastNewTicket };
