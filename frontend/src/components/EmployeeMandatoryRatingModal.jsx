import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { listPendingRatings, rateTicket } from "../services/tickets";
import { useAuth } from "../hooks/useAuth";
import { useTicketEvents } from "../hooks/useTicketEvents";
import { StatusChip } from "./TicketChips";

export default function EmployeeMandatoryRatingModal() {
  const { user } = useAuth();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stars, setStars] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [hoveredStar, setHoveredStar] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setSubmitError(null);
    try {
      const res = await listPendingRatings();
      setPending(res.tickets || []);
      setStars(null);
      setFeedback("");
    } catch {
      setPending([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role !== "EMPLOYEE") return;
    refresh();
  }, [user?.role, user?.id, refresh]);

  useTicketEvents(undefined, () => {
    if (user?.role === "EMPLOYEE") refresh();
  });

  const current = pending[0] || null;

  async function submit() {
    if (!current) return;
    if (stars == null || stars < 1 || stars > 5) {
      setSubmitError("Please select a star rating (1–5).");
      return;
    }
    setSubmitError(null);
    setBusy(true);
    try {
      await rateTicket(current.id, stars, feedback.trim() || undefined);
      await refresh();
    } catch (e) {
      setSubmitError(e?.response?.data?.error || "Failed to submit rating");
    } finally {
      setBusy(false);
    }
  }

  if (user?.role !== "EMPLOYEE") return null;

  const root = document.getElementById("modal-root") || document.body;
  const total = pending.length;

  if (!loading && pending.length === 0) return null;

  if (loading) {
    return createPortal(
      <div className="w-full min-h-full flex items-center justify-center p-4 bg-black/55 dark:bg-black/70 backdrop-blur-sm pointer-events-auto">
        <div className="card px-8 py-6 text-sm text-gray-600 dark:text-gray-300">Checking for tickets to rate…</div>
      </div>,
      root
    );
  }

  return createPortal(
    <div
      className="w-full min-h-full flex items-center justify-center p-4 bg-black/55 dark:bg-black/70 backdrop-blur-sm pointer-events-auto"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mandatory-rating-title"
        aria-describedby="mandatory-rating-desc"
        className="card w-full max-w-lg max-h-[min(90vh,36rem)] overflow-y-auto p-6 shadow-2xl border border-black/10 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="mandatory-rating-title" className="text-lg font-bold text-gray-900 dark:text-white">
          Rate IT support (required)
        </h2>
        <p id="mandatory-rating-desc" className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          You have completed ticket{total !== 1 ? "s" : ""} that must be rated before you can continue using the app.
          This helps us recognize great support and improve service.
        </p>

        {current && (
          <div className="mt-5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-800/50 p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Ticket #{current.ticketNumber}
              </span>
              <StatusChip status={current.status} />
            </div>
            <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-3">{current.subject}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              IT support: <span className="font-medium text-gray-900 dark:text-white">{current.technicianName}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {total > 1 ? `${total} tickets remaining — you are on 1 of ${total}.` : "Last ticket to rate."}
            </p>
          </div>
        )}

        <div className="mt-5">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Your rating (required)</p>
          <div className="flex gap-1" onMouseLeave={() => setHoveredStar(null)}>
            {[1, 2, 3, 4, 5].map((s) => {
              const highlighted = (hoveredStar != null && s <= hoveredStar) || (stars != null && s <= stars);
              return (
                <button
                  key={s}
                  type="button"
                  disabled={busy}
                  onClick={() => setStars(s)}
                  onMouseEnter={() => setHoveredStar(s)}
                  className="relative p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 w-10 h-10 inline-flex items-center justify-center"
                  aria-label={`${s} star${s !== 1 ? "s" : ""}`}
                >
                  <span
                    className={`text-2xl transition-colors ${
                      highlighted ? "text-amber-400" : "text-gray-300 dark:text-gray-600"
                    }`}
                  >
                    {highlighted ? "★" : "☆"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="mandatory-rating-feedback" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Feedback (optional)
          </label>
          <textarea
            id="mandatory-rating-feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            maxLength={2000}
            disabled={busy}
            placeholder="Share any comments about your experience…"
            className="input-field w-full resize-y min-h-[4.5rem]"
          />
        </div>

        {submitError && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
            {submitError}
          </p>
        )}

        <div className="mt-6">
          <button
            type="button"
            onClick={submit}
            disabled={busy || stars == null}
            className="btn-primary w-full py-2.5"
          >
            {busy ? "Submitting…" : "Submit rating"}
          </button>
        </div>
      </div>
    </div>,
    root
  );
}
