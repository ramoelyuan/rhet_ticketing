import axios from "axios";
import { getPublicApiBase } from "../utils/mediaUrl";

const api = axios.create({
  baseURL: getPublicApiBase(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function apiGet(path, params) {
  const res = await api.get(path, { params });
  return res.data;
}

export async function apiPost(path, body, config) {
  const res = await api.post(path, body, config);
  return res.data;
}

export async function apiPatch(path, body) {
  const res = await api.patch(path, body);
  return res.data;
}

export async function apiDelete(path) {
  const res = await api.delete(path);
  return res.data;
}

export default api;

