/**
 * API / static origin for axios and for building /uploads URLs.
 *
 * - Set VITE_API_URL when the API is on another host (incl. LAN IP in dev).
 * - Production + unset: same-origin (empty base) so nginx can proxy /api and /uploads.
 * - Dev + unset: http://localhost:5000 (Vite does not serve /uploads).
 */
export function getPublicApiBase() {
  const raw = import.meta.env.VITE_API_URL;
  if (raw != null && String(raw).trim() !== "") {
    return String(raw).replace(/\/+$/, "");
  }
  if (import.meta.env.PROD && typeof window !== "undefined" && window.location?.origin) {
    return "";
  }
  return "http://localhost:5000";
}

/**
 * Absolute or same-origin URL for files served by the backend (e.g. /uploads/avatars/...).
 */
export function resolveMediaUrl(path) {
  if (!path || typeof path !== "string") return null;
  const trimmed = path.startsWith("/") ? path : `/${path}`;
  const base = getPublicApiBase();
  if (base === "") return trimmed;
  return `${base}${trimmed}`;
}
