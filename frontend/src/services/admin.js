import api from "./api";
import { apiGet, apiPatch, apiPost } from "./api";

export async function adminDashboard() {
  return await apiGet("/api/admin/dashboard");
}

export async function listCategories() {
  return await apiGet("/api/admin/categories");
}

export async function createCategory(name) {
  return await apiPost("/api/admin/categories", { name });
}

export async function toggleCategory(id) {
  return await apiPatch(`/api/admin/categories/${id}/toggle`, {});
}

export async function listEmployees() {
  return await apiGet("/api/admin/employees");
}

export async function createEmployee(body) {
  return await apiPost("/api/admin/employees", body);
}

export async function listTechnicians() {
  return await apiGet("/api/admin/technicians");
}

export async function createTechnician(body) {
  return await apiPost("/api/admin/technicians", body);
}

export async function toggleTechAvailability(id) {
  return await apiPatch(`/api/admin/technicians/${id}/toggle-availability`, {});
}

export async function toggleUserActive(id) {
  return await apiPatch(`/api/admin/users/${id}/toggle-active`, {});
}

export async function assignTicket(ticketId, technicianId) {
  return await apiPost(`/api/admin/tickets/${ticketId}/assign`, { technicianId });
}

export async function listActivityLogs(limit = 100) {
  return await apiGet("/api/admin/activity", { limit });
}

export async function reportTicketsPerTechnician() {
  return await apiGet("/api/admin/reports/tickets-per-technician");
}
export async function reportCategoryDistribution() {
  return await apiGet("/api/admin/reports/category-distribution");
}
export async function reportMonthlyTrends() {
  return await apiGet("/api/admin/reports/monthly-trends");
}
export async function reportTechnicianPerformance() {
  return await apiGet("/api/admin/reports/technician-performance");
}
export async function reportTechnicianRankingMonth() {
  return await apiGet("/api/admin/reports/technician-ranking-month");
}
export async function reportTechnicianRatingRankingMonth(params) {
  return await apiGet("/api/admin/reports/technician-rating-ranking-month", params);
}

export async function getCertificateTechnicianOfTheMonth(month, year) {
  const res = await api.get("/api/certificate/technician-of-the-month", {
    params: { month, year },
    responseType: "blob",
  });
  const contentType = res.headers["content-type"] || "";
  if (contentType.includes("application/json")) {
    const text = await res.data.text();
    const data = JSON.parse(text);
    throw new Error(data.error || "Failed to generate certificate");
  }
  return res.data;
}

export async function getCertificateTechnicianOfTheMonthByRating(month, year) {
  const res = await api.get("/api/certificate/technician-of-the-month-by-rating", {
    params: { month, year },
    responseType: "blob",
  });
  const contentType = res.headers["content-type"] || "";
  if (contentType.includes("application/json")) {
    const text = await res.data.text();
    const data = JSON.parse(text);
    throw new Error(data.error || "Failed to generate certificate");
  }
  return res.data;
}

