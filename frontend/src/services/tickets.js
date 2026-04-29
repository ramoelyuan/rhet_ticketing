import { apiGet, apiPatch, apiPost } from "./api";

export async function listTickets(params) {
  return await apiGet("/api/tickets", params);
}

export async function createTicket(body) {
  return await apiPost("/api/tickets", body);
}

export async function getTicket(id) {
  return await apiGet(`/api/tickets/${id}`);
}

export async function addReply(id, body) {
  return await apiPost(`/api/tickets/${id}/replies`, body);
}

export async function updateStatus(id, statusOrBody) {
  const body = typeof statusOrBody === "string" ? { status: statusOrBody } : statusOrBody;
  return await apiPost(`/api/tickets/${id}/status`, body);
}

export async function listPendingRatings() {
  return await apiGet("/api/tickets/pending-ratings");
}

export async function rateTicket(id, rating, feedback) {
  const body = { rating };
  if (feedback != null && String(feedback).trim() !== "") body.feedback = String(feedback).trim();
  return await apiPatch(`/api/tickets/${id}/rate`, body);
}

export async function takeTicket(id) {
  return await apiPost(`/api/tickets/${id}/take`, {});
}

export async function technicianWorkload() {
  return await apiGet("/api/tickets/technicians/workload");
}

