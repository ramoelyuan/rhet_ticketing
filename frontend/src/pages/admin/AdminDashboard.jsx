import React, { useEffect, useState } from "react";
import TicketTable from "../../components/TicketTable";
import { listTickets } from "../../services/tickets";

const STATUS_GROUP_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "resolved", label: "Resolved" },
  { value: "unresolved", label: "Unresolved" },
];

export default function AdminDashboard() {
  const [tickets, setTickets] = useState({ items: [], total: 0 });
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [statusGroup, setStatusGroup] = useState("active");
  const [initialLoaded, setInitialLoaded] = useState(false);

  useEffect(() => {
    function fetchTickets() {
      if (!initialLoaded) setTicketsLoading(true);
      listTickets({ page: 1, limit: 10, statusGroup })
        .then((r) => setTickets({ items: r.items || [], total: r.total || 0 }))
        .catch(() => {
          // Keep last data on background refresh failures.
          if (!initialLoaded) setTickets({ items: [], total: 0 });
        })
        .finally(() => {
          if (!initialLoaded) {
            setTicketsLoading(false);
            setInitialLoaded(true);
          }
          setLastUpdatedAt(new Date());
        });
    }
    fetchTickets();
    const interval = setInterval(fetchTickets, 30 * 1000);
    return () => clearInterval(interval);
  }, [statusGroup, initialLoaded]);

  return (
    <div className="relative min-h-full">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="pointer-events-none fixed inset-0 -z-10 h-full w-full object-cover dark:hidden"
        src="/idle/adminidlelight.mp4"
      />
      <video
        autoPlay
        muted
        loop
        playsInline
        className="pointer-events-none fixed inset-0 -z-10 h-full w-full object-cover hidden dark:block"
        src="/idle/adminidle.mp4"
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-black/40 dark:bg-black/50" aria-hidden />
      <div className="pointer-events-none fixed inset-0 -z-10 stats-screen-bg" />
      <div className="pointer-events-none fixed inset-0 -z-10 stats-screen-grid opacity-60 dark:opacity-35" />

      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="rounded-xl border border-white/50 dark:border-white/40 bg-white/55 dark:bg-white/25 px-4 py-2.5 backdrop-blur-md shadow-lg">
            <h1 className="text-lg md:text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Tickets
            </h1>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={statusGroup}
              onChange={(e) => setStatusGroup(e.target.value)}
              className="rounded-full border border-white/50 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/60 px-3 py-1.5 backdrop-blur shadow-sm text-xs font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              {STATUS_GROUP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/50 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/60 px-3 py-1.5 backdrop-blur shadow-sm">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Total</span>
              <span className="text-xs font-bold tabular-nums text-gray-900 dark:text-white">{tickets.total}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/50 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/60 px-3 py-1.5 backdrop-blur shadow-sm">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Updated</span>
              <span className="text-xs font-bold tabular-nums text-gray-900 dark:text-white">{lastUpdatedAt ? lastUpdatedAt.toLocaleTimeString() : "—"}</span>
            </div>
            <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600/90 via-sky-500/90 to-emerald-500/90 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
              Live
            </div>
          </div>
        </div>

        {ticketsLoading ? (
          <div className="rounded-2xl h-[32rem] animate-pulse bg-white/60 dark:bg-slate-900/60 border border-white/40 dark:border-slate-800/70 shadow-[0_18px_45px_-25px_rgba(0,0,0,0.35)] backdrop-blur" />
        ) : (
          <div className="relative rounded-2xl overflow-hidden bg-white/75 dark:bg-slate-900/70 border border-white/40 dark:border-slate-800/70 shadow-[0_22px_55px_-30px_rgba(0,0,0,0.45)] backdrop-blur">
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-500" />
            <div className="h-[32rem] overflow-y-auto overflow-x-auto">
              <TicketTable title={null} rows={tickets.items} detailsBasePath={null} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
