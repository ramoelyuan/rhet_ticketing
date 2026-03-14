import React, { useEffect, useMemo, useState } from "react";
import { technicianWorkload } from "../../services/tickets";
import Loading from "../../components/Loading";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function StatCard({ label, value }) {
  return (
    <div className="card p-5">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

export default function WorkloadDashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    technicianWorkload()
      .then((r) => setRows(r.technicians || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => {
    let totalAssigned = 0, active = 0, resolved = 0, urgent = 0;
    for (const t of rows) {
      totalAssigned += t.totalAssigned;
      active += t.activeTickets;
      resolved += t.resolvedTickets;
      urgent += t.urgentActive;
    }
    return { totalAssigned, active, resolved, urgent };
  }, [rows]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">IT Support Workload Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? (
            <div className="col-span-full card min-h-24 flex items-center justify-center">
              <Loading />
            </div>
          )
          : (
            <>
              <StatCard label="Total Assigned" value={totals.totalAssigned} />
              <StatCard label="Active Tickets" value={totals.active} />
              <StatCard label="Resolved Tickets" value={totals.resolved} />
              <StatCard label="Urgent Active" value={totals.urgent} />
            </>
          )}
      </div>
      <div className="card p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Workload comparison (Active tickets)
        </h2>
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <Loading />
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="activeTickets" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      {!loading && rows.length > 0 && (
        <div className="card p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            IT support workload distribution
          </h2>
          <ul className="space-y-3">
            {rows.map((t) => {
              const total = t.totalAssigned || 1;
              const activePct = Math.round((t.activeTickets / total) * 100);
              return (
                <li key={t.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">{t.name}</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {t.activeTickets} active / {t.totalAssigned} total
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${isNaN(activePct) ? 0 : activePct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
