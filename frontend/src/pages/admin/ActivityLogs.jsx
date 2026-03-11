import React, { useEffect, useState } from "react";
import { listActivityLogs } from "../../services/admin";

function formatActorRole(role) {
  if (role === "TECHNICIAN") return "IT Support";
  if (role === "ADMIN") return "IT Admin";
  if (role === "EMPLOYEE") return "IT Employee";
  return role;
}

function formatDetails(action, meta) {
  if (!meta || typeof meta !== "object") return "—";
  const m = meta;
  switch (action) {
    case "TICKET_STATUS_CHANGED":
      return m.from != null && m.to != null
        ? `Status changed from ${m.from.replace(/_/g, " ")} to ${m.to.replace(/_/g, " ")}`
        : m.ticketId ? `Ticket ${m.ticketId.slice(0, 8)}…` : "—";
    case "TICKET_ASSIGNED":
      return m.to ? `Assigned to ${m.to}` : m.from ? "Unassigned" : "—";
    case "TICKET_TAKEN":
      return "Ticket taken";
    case "TICKET_REPLIED":
      return m.isInternal ? "Internal note added" : "Reply added";
    case "CATEGORY_CREATED":
      return m.name ? `Category "${m.name}" created` : "—";
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
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3"><div className="h-4 w-28 bg-gray-100 dark:bg-slate-800 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-40 bg-gray-100 dark:bg-slate-800 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-20 bg-gray-100 dark:bg-slate-800 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-40 bg-gray-100 dark:bg-slate-800 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-64 bg-gray-100 dark:bg-slate-800 rounded" /></td>
                </tr>
              ))
            ) : rows.length ? (
              rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {r.actorRole === "ADMIN" ? "IT Admin" : r.actorRole === "EMPLOYEE" ? "IT Employee" : r.actorName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {formatActorRole(r.actorRole)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    {r.action}
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

