import { apiPost } from "./api";

export async function login(email, password) {
  return await apiPost("/api/auth/login", { email, password });
}

export async function fetchMe() {
  const { apiGet } = await import("./api");
  return await apiGet("/api/auth/me");
}

export async function changePassword(currentPassword, newPassword) {
  return await apiPost("/api/auth/change-password", { currentPassword, newPassword });
}

