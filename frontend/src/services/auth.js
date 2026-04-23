import { apiPost, apiPatch, apiDelete } from "./api";
import api from "./api";

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

export async function updateProfile({ fullName, department }) {
  return await apiPatch("/api/auth/profile", {
    fullName,
    department: department == null || department === "" ? null : department,
  });
}

export async function uploadProfileAvatar(file) {
  const fd = new FormData();
  fd.append("avatar", file);
  const res = await api.post("/api/auth/profile/avatar", fd);
  return res.data;
}

export async function deleteProfileAvatar() {
  return await apiDelete("/api/auth/profile/avatar");
}

