import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TicketTable from "../../components/TicketTable";
import Loading from "../../components/Loading";
import { listTickets } from "../../services/tickets";
import { useTicketEvents } from "../../hooks/useTicketEvents";

export default function AssignedTickets() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ items: [], total: 0, limit: 10 });
  const [searchParams] = useSearchParams();
  const debounceRef = useRef(null);

  async function load(nextPage = page) {
    setLoading(true);
    try {
      const res = await listTickets({
        page: nextPage,
        limit: 10,
        q: q || undefined,
        status: status || undefined,
        priority: priority || undefined,
      });
      setData(res);
    } finally {
      setLoading(false);
    }
  }

  useTicketEvents(() => {
    load(1).then(() => setPage(1)).catch(() => {});
  });

  useEffect(() => {
    const initialQ = searchParams.get("q") || "";
    if (initialQ) setQ(initialQ);
    load(1).then(() => setPage(1)).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      load(1).then(() => setPage(1)).catch(() => {});
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q, status, priority]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Assigned Tickets</h1>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-5">
          <input
            type="search"
            placeholder="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input-field"
          />
        </div>
        <div className="md:col-span-3">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field">
            <option value="">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="NOT_RESOLVED">Not Resolved</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input-field">
            <option value="">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>
      {loading ? (
        <div className="card min-h-64 flex items-center justify-center">
          <Loading />
        </div>
      ) : (
      <TicketTable title="Tickets" rows={data.items} detailsBasePath="/technician/tickets" />
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => load(page - 1).then(() => setPage((p) => p - 1))}
          className="btn-secondary disabled:opacity-50"
        >
          Prev
        </button>
        <button
          type="button"
          disabled={page * data.limit >= data.total}
          onClick={() => load(page + 1).then(() => setPage((p) => p + 1))}
          className="btn-secondary disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
