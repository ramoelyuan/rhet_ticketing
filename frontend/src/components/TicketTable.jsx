import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { PriorityChip, StatusChip } from "./TicketChips";

function sortRows(rows, orderBy, order) {
  if (!orderBy) return rows;
  const sorted = [...rows].sort((a, b) => {
    const av = a[orderBy];
    const bv = b[orderBy];
    if (av == null && bv == null) return 0;
    if (av == null) return -1;
    if (bv == null) return 1;
    if (av > bv) return 1;
    if (av < bv) return -1;
    return 0;
  });
  return order === "desc" ? sorted.reverse() : sorted;
}

function SortHeader({ column, currentOrderBy, currentOrder, onSort, children }) {
  const active = currentOrderBy === column;
  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className="inline-flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
    >
      {children}
      {active ? (
        currentOrder === "asc" ? (
          <ChevronUpIcon className="w-4 h-4" />
        ) : (
          <ChevronDownIcon className="w-4 h-4" />
        )
      ) : (
        <span className="w-4 opacity-0 group-hover:opacity-50" />
      )}
    </button>
  );
}

export default function TicketTable({ title, rows, detailsBasePath }) {
  const [orderBy, setOrderBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const showAction = detailsBasePath != null;
  const showHeader = title != null && title !== "";
  const roomy = !showAction; // read-only tables are used for big-screen stats

  const displayRows = useMemo(
    () => sortRows(rows || [], orderBy, order),
    [rows, orderBy, order]
  );

  function handleSort(column) {
    if (orderBy === column) setOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setOrderBy(column);
      setOrder("asc");
    }
  }

  return (
    <div className="card">
      {showHeader && (
        <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">{rows?.length || 0} shown</span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-white/70 dark:bg-slate-900/55 sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <tr>
              <th className={`px-5 ${roomy ? "py-4" : "py-3"} text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}>
                <SortHeader column="ticketNumber" currentOrderBy={orderBy} currentOrder={order} onSort={handleSort}>
                  Ticket ID
                </SortHeader>
              </th>
              <th className={`px-5 ${roomy ? "py-4" : "py-3"} text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}>
                <SortHeader column="createdByName" currentOrderBy={orderBy} currentOrder={order} onSort={handleSort}>
                  Requested by
                </SortHeader>
              </th>
              <th className={`px-5 ${roomy ? "py-4" : "py-3"} text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}>
                Category
              </th>
              <th className={`px-5 ${roomy ? "py-4" : "py-3"} text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}>
                Priority
              </th>
              <th className={`px-5 ${roomy ? "py-4" : "py-3"} text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}>
                Status
              </th>
              <th className={`px-5 ${roomy ? "py-4" : "py-3"} text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}>
                IT Support
              </th>
              <th className={`px-5 ${roomy ? "py-4" : "py-3"} text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}>
                <SortHeader column="createdAt" currentOrderBy={orderBy} currentOrder={order} onSort={handleSort}>
                  Requested at
                </SortHeader>
              </th>
              <th className={`px-5 ${roomy ? "py-4" : "py-3"} text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}>
                Resolved at
              </th>
              {showAction && (
                <th className={`px-5 ${roomy ? "py-4" : "py-3"} text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}>
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {displayRows.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className={`px-5 ${roomy ? "py-4" : "py-3"} ${roomy ? "text-base" : "text-sm"} text-gray-900 dark:text-gray-100 whitespace-nowrap`}>{t.ticketNumber}</td>
                <td className={`px-5 ${roomy ? "py-4" : "py-3"} ${roomy ? "text-base" : "text-sm"} font-medium text-gray-900 dark:text-white max-w-xs truncate`} title={t.createdByName}>
                  {t.createdByName || "—"}
                </td>
                <td className={`px-5 ${roomy ? "py-4" : "py-3"} ${roomy ? "text-base" : "text-sm"} text-gray-600 dark:text-gray-400`}>{t.category || "—"}</td>
                <td className={`px-5 ${roomy ? "py-4" : "py-3"}`}>
                  <PriorityChip priority={t.priority} />
                </td>
                <td className={`px-5 ${roomy ? "py-4" : "py-3"}`}>
                  <StatusChip status={t.status} />
                </td>
                <td className={`px-5 ${roomy ? "py-4" : "py-3"} ${roomy ? "text-base" : "text-sm"} text-gray-600 dark:text-gray-400`}>{t.technicianName || "—"}</td>
                <td className={`px-5 ${roomy ? "py-4" : "py-3"} ${roomy ? "text-base" : "text-sm"} text-gray-600 dark:text-gray-400 whitespace-nowrap`}>
                  {t.createdAt ? new Date(t.createdAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }) : "—"}
                </td>
                <td className={`px-5 ${roomy ? "py-4" : "py-3"} ${roomy ? "text-base" : "text-sm"} text-gray-600 dark:text-gray-400 whitespace-nowrap`}>
                  {t.resolvedAt ? new Date(t.resolvedAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }) : "—"}
                </td>
                {showAction && (
                  <td className="px-5 py-3 text-right">
                    <Link to={`${detailsBasePath}/${t.id}`} className="btn-primary py-1.5 px-3 text-xs">
                      Details
                    </Link>
                  </td>
                )}
              </tr>
            ))}
            {!rows?.length && (
              <tr>
                <td colSpan={showAction ? 9 : 8} className="px-5 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                  No tickets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
