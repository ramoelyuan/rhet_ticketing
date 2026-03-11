import React, { useEffect, useMemo, useState } from "react";
import { listTickets } from "../../services/tickets";
import TicketTable from "../../components/TicketTable";

function StatCard({ label, value }) {
  return (
    <div className="card p-5 h-full bg-gradient-to-br from-white to-gray-50/50 dark:from-slate-900 dark:to-slate-800/50">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

export default function EmployeeDashboard() {
  const [data, setData] = useState({ items: [], total: 0 });

  useEffect(() => {
    listTickets({ page: 1, limit: 10 }).then(setData).catch(() => setData({ items: [], total: 0 }));
  }, []);

  const stats = useMemo(() => {
    const counts = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, NOT_RESOLVED: 0 };
    for (const t of data.items) counts[t.status] = (counts[t.status] || 0) + 1;
    return counts;
  }, [data]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Support Tickets</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Snapshot of your recent requests and their current status.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="My Tickets (recent)" value={data.total} />
        <StatCard label="Open" value={stats.OPEN} />
        <StatCard label="In Progress" value={stats.IN_PROGRESS} />
        <StatCard label="Resolved" value={stats.RESOLVED} />
        <StatCard label="Not Resolved" value={stats.NOT_RESOLVED} />
      </div>
      <TicketTable title="Recent Tickets" rows={data.items} detailsBasePath="/employee/tickets" />
    </div>
  );
}
