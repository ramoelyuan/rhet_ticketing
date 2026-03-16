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

export async function updateStatus(id, status) {
  return await apiPost(`/api/tickets/${id}/status`, { status });
}

export async function rateTicket(id, rating) {
  return await apiPatch(`/api/tickets/${id}/rate`, { rating });
}

export async function takeTicket(id) {
  return await apiPost(`/api/tickets/${id}/take`, {});
}

export async function technicianWorkload() {
  return await apiGet("/api/tickets/technicians/workload");
}

