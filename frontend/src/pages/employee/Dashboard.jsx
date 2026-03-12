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
  const [totals, setTotals] = useState({ all: 0, OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, NOT_RESOLVED: 0 });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [recent, all, open, inProgress, resolved, notResolved] = await Promise.all([
          listTickets({ page: 1, limit: 10 }),
          listTickets({ page: 1, limit: 1 }),
          listTickets({ page: 1, limit: 1, status: "OPEN" }),
          listTickets({ page: 1, limit: 1, status: "IN_PROGRESS" }),
          listTickets({ page: 1, limit: 1, status: "RESOLVED" }),
          listTickets({ page: 1, limit: 1, status: "NOT_RESOLVED" }),
        ]);
        if (cancelled) return;
        setData(recent);
        setTotals({
          all: all?.total || 0,
          OPEN: open?.total || 0,
          IN_PROGRESS: inProgress?.total || 0,
          RESOLVED: resolved?.total || 0,
          NOT_RESOLVED: notResolved?.total || 0,
        });
      } catch {
        if (!cancelled) {
          setData({ items: [], total: 0 });
          setTotals({ all: 0, OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, NOT_RESOLVED: 0 });
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
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
        <StatCard label="My Tickets" value={totals.all} />
        <StatCard label="Open" value={totals.OPEN} />
        <StatCard label="In Progress" value={totals.IN_PROGRESS} />
        <StatCard label="Resolved" value={totals.RESOLVED} />
        <StatCard label="Not Resolved" value={totals.NOT_RESOLVED} />
      </div>
      <TicketTable title="Recent Tickets" rows={data.items} detailsBasePath="/employee/tickets" />
    </div>
  );
}
