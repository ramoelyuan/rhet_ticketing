import React, { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import { listActivityLogs } from "../../services/admin";

function formatActorRole(role) {
  if (role === "TECHNICIAN") return "IT Support";
  if (role === "ADMIN") return "Admin";
  if (role === "EMPLOYEE") return "Employee";
  return role;
}

function formatActionLabel(action) {
  const labels = {
    TICKET_STATUS_CHANGED: "Ticket status changed",
    TICKET_ASSIGNED: "Ticket assigned",
    TICKET_TAKEN: "Ticket taken",
    TICKET_REPLIED: "Ticket reply",
    CATEGORY_CREATED: "Category created",
    CATEGORY_TOGGLED: "Category toggled",
    EMPLOYEE_CREATED: "Employee created",
    IT_SUPPORT_CREATED: "IT Support created",
    USER_ACTIVE_TOGGLED: "User active toggled",
  };
  return labels[action] || action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatStatus(s) {
  if (s == null || typeof s !== "string") return "";
  return s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDetails(action, meta) {
  if (!meta || typeof meta !== "object") return "—";
  const m = meta;
  switch (action) {
    case "TICKET_STATUS_CHANGED":
      return m.from != null && m.to != null
        ? `From ${formatStatus(m.from)} to ${formatStatus(m.to)}`
        : m.ticketId ? `Ticket ${String(m.ticketId).slice(0, 8)}…` : "—";
    case "TICKET_ASSIGNED":
      return m.to != null ? "Assigned to technician" : m.from != null ? "Unassigned" : "—";
    case "TICKET_TAKEN":
      return "Ticket taken by IT Support";
    case "TICKET_REPLIED":
      return m.isInternal ? "Internal note added" : "Reply added";
    case "CATEGORY_CREATED":
      return m.name ? `"${m.name}"` : "—";
    case "CATEGORY_TOGGLED":
      return m.isActive === true ? "Category enabled" : m.isActive === false ? "Category disabled" : "—";
    case "EMPLOYEE_CREATED":
      return m.email ? `Account created: ${m.email}` : "—";
    case "IT_SUPPORT_CREATED":
      return m.email ? `Account created: ${m.email}` : "—";
    case "USER_ACTIVE_TOGGLED":
      return m.isActive === true ? "User activated" : m.isActive === false ? "User deactivated" : "—";
    default:
      if (Object.keys(m).length === 0) return "—";
      return Object.entries(m)
        .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
        .join(" · ");
  }
}

export default function ActivityLogs() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listActivityLogs(150)
      .then((r) => setRows(r.items || []))
      .catch((e) => setError(e?.response?.data?.error || "Failed to load activity logs"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Activity Logs</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Records actions made by Admin and IT Support.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="card p-5 overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-gray-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actor
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Action
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8">
                  <Loading />
                </td>
              </tr>
            ) : rows.length ? (
              rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {r.actorName || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {formatActorRole(r.actorRole)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    {formatActionLabel(r.action)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {formatDetails(r.action, r.meta)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
                  No activity logs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

