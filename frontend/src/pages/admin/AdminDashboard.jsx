import React, { useEffect, useMemo, useRef, useState } from "react";
import TicketTable from "../../components/TicketTable";
import { listTickets } from "../../services/tickets";

const STATUS_GROUP_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "resolved", label: "Resolved" },
  { value: "unresolved", label: "Unresolved" },
];

export default function AdminDashboard() {
  const pageSize = 5;
  const [tickets, setTickets] = useState({ items: [], total: 0 });
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [statusGroup, setStatusGroup] = useState("active");
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const notificationAudioRef = useRef(null);
  const audioUnlockedRef = useRef(false);
  const lastOpenTotalRef = useRef(null);

  const hasPrev = page > 1;
  const hasNext = page * pageSize < tickets.total;

  const displayItems = useMemo(() => {
    if (statusGroup !== "active") return tickets.items;
    // Backend already sorts active by priority, but keep a stable client sort too.
    const weight = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    return [...(tickets.items || [])].sort((a, b) => {
      const pa = weight[a.priority] || 0;
      const pb = weight[b.priority] || 0;
      if (pb !== pa) return pb - pa;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [tickets.items, statusGroup]);

  useEffect(() => {
    if (!notificationAudioRef.current) {
      const base = (import.meta?.env?.BASE_URL || "/").replace(/\/?$/, "/");
      const a = new Audio(`${base}soundeffect/notificationssound.mp3`);
      a.preload = "auto";
      a.volume = 1.0;
      notificationAudioRef.current = a;
    }

    function unlockAudio() {
      audioUnlockedRef.current = true;
      const a = notificationAudioRef.current;
      if (!a) return;
      try {
        const prevVol = a.volume;
        a.volume = 0.01;
        a.currentTime = 0;
        const p = a.play();
        if (p && typeof p.then === "function") {
          p.then(() => {
            a.pause();
            a.currentTime = 0;
            a.volume = prevVol;
          }).catch(() => {
            a.volume = prevVol;
          });
        } else {
          a.pause();
          a.currentTime = 0;
          a.volume = prevVol;
        }
      } catch {
        // ignore
      }
    }

    const unlockEvents = ["pointerdown", "keydown", "touchstart"];
    unlockEvents.forEach((ev) => window.addEventListener(ev, unlockAudio, { passive: true }));
    return () => {
      unlockEvents.forEach((ev) => window.removeEventListener(ev, unlockAudio, { passive: true }));
    };
  }, []);

  useEffect(() => {
    function fetchTickets() {
      if (!initialLoaded) setTicketsLoading(true);
      listTickets({ page, limit: pageSize, statusGroup })
        .then((r) => {
          const items = r.items || [];
          const total = r.total || 0;
          setTickets({ items, total });

          // Play sound at the exact same time the table updates when a new active ticket exists.
          if (statusGroup === "active" && audioUnlockedRef.current) {
            if (lastOpenTotalRef.current == null) {
              lastOpenTotalRef.current = total;
            } else if (total > lastOpenTotalRef.current) {
              const a = notificationAudioRef.current;
              if (a) {
                try {
                  a.pause();
                  a.currentTime = 0;
                  a.volume = 1.0;
                  a.play().catch(() => {});
                } catch {
                  // ignore
                }
              }
              lastOpenTotalRef.current = total;
            } else {
              lastOpenTotalRef.current = total;
            }
          }
        })
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
    const intervalMs = statusGroup === "active" ? 5 * 1000 : 30 * 1000;
    const interval = setInterval(fetchTickets, intervalMs);
    return () => clearInterval(interval);
  }, [statusGroup, initialLoaded, page]);

  useEffect(() => {
    setPage(1);
  }, [statusGroup]);

  return (
    <div className="relative min-h-full">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="pointer-events-none fixed inset-0 -z-10 h-full w-full object-cover dark:hidden"
        src="/idle/LCAVID.mp4"
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

      <div className="space-y-3 uppercase">
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
            <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
              Live
            </div>
          </div>
        </div>

        {ticketsLoading ? (
          <div className="rounded-2xl h-[32rem] animate-pulse bg-white/60 dark:bg-slate-900/60 border border-white/40 dark:border-slate-800/70 shadow-[0_18px_45px_-25px_rgba(0,0,0,0.35)] backdrop-blur" />
        ) : (
          <div className="relative rounded-2xl overflow-hidden bg-white/60 dark:bg-slate-900/60 border border-white/40 dark:border-slate-800/70 shadow-[0_22px_55px_-30px_rgba(0,0,0,0.45)] backdrop-blur">
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-500" />
            <div className="overflow-x-auto">
              <TicketTable
                title={null}
                rows={displayItems}
                detailsBasePath={null}
                showResolvedAt={statusGroup === "resolved"}
                disableSort
                size="large"
                translucent
              />
            </div>
            {(hasPrev || hasNext) && (
              <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/30 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40 backdrop-blur">
                <button
                  type="button"
                  disabled={!hasPrev}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="btn-secondary disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={!hasNext}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-primary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
