import React, { useMemo } from "react";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function buildPageItems(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items = new Set([1, 2, total - 1, total, current - 1, current, current + 1]);
  const pages = Array.from(items)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const out = [];
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    const prev = pages[i - 1];
    if (i > 0 && p - prev > 1) out.push("…");
    out.push(p);
  }
  return out;
}

export default function Pagination({
  page,
  pageSize,
  total,
  onChange,
  className = "",
  showSummary = true,
}) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 10)));
  const safePage = clamp(page || 1, 1, totalPages);
  const hasPrev = safePage > 1;
  const hasNext = safePage < totalPages;

  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = total === 0 ? 0 : Math.min(total, safePage * pageSize);

  const items = useMemo(() => buildPageItems(safePage, totalPages), [safePage, totalPages]);

  if (!total || total <= pageSize) {
    return showSummary ? (
      <div className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>
        Showing {start}-{end} of {total || 0}
      </div>
    ) : null;
  }

  return (
    <div className={`flex flex-wrap items-center justify-between gap-2 ${className}`}>
      {showSummary ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {start}-{end} of {total}
        </div>
      ) : (
        <span />
      )}

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={!hasPrev}
          onClick={() => hasPrev && onChange(safePage - 1)}
          className="btn-secondary disabled:opacity-50"
        >
          Previous
        </button>

        <div className="hidden sm:flex items-center gap-1">
          {items.map((it, idx) =>
            it === "…" ? (
              <span key={`e-${idx}`} className="px-2 text-sm text-gray-500 dark:text-gray-400">
                …
              </span>
            ) : (
              <button
                key={it}
                type="button"
                onClick={() => onChange(it)}
                className={`h-9 min-w-9 px-2 rounded-lg text-sm font-medium transition-colors ${
                  it === safePage
                    ? "bg-primary text-white"
                    : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                }`}
              >
                {it}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          disabled={!hasNext}
          onClick={() => hasNext && onChange(safePage + 1)}
          className="btn-secondary disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

