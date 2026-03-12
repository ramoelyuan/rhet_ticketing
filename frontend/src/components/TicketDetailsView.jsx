import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getTicket, addReply, updateStatus, takeTicket } from "../services/tickets";
import { PriorityChip, StatusChip } from "./TicketChips";
import TicketTimeline from "./TicketTimeline";
import { useAuth } from "../hooks/useAuth";
import { assignTicket, listTechnicians } from "../services/admin";

export default function TicketDetailsView() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [status, setStatus] = useState("");
  const [techs, setTechs] = useState([]);
  const [techId, setTechId] = useState("");
  const [assignBusy, setAssignBusy] = useState(false);
  const [takeBusy, setTakeBusy] = useState(false);

  async function load() {
    const res = await getTicket(id);
    setData(res);
    setStatus(res.ticket.status);
    setTechId(res.ticket.assignedTechnician?.id || "");
  }

  useEffect(() => {
    load().catch((e) => setError(e?.response?.data?.error || "Failed to load ticket"));
  }, [id]);

  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    listTechnicians()
      .then((r) => setTechs(r.technicians || []))
      .catch(() => setTechs([]));
  }, [user?.role]);

  async function submitReply() {
    setError(null);
    try {
      await addReply(id, { message, isInternal });
      setMessage("");
      setIsInternal(false);
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to send reply");
    }
  }

  async function submitStatus() {
    const statusLabel = { OPEN: "Open", IN_PROGRESS: "In Progress", RESOLVED: "Resolved", NOT_RESOLVED: "Not Resolved" }[status];
    const msg =
      status === "RESOLVED" || status === "NOT_RESOLVED"
        ? (status === "RESOLVED" ? "Mark as Resolved?" : "Mark as Not Resolved?") + " Once set, the ticket cannot be edited."
        : `Change status to "${statusLabel}"?`;
    if (!window.confirm(msg)) return;
    setError(null);
    try {
      await updateStatus(id, status);
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to update status");
    }
  }

  async function submitTake() {
    setError(null);
    setTakeBusy(true);
    try {
      await takeTicket(id);
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to take ticket");
    } finally {
      setTakeBusy(false);
    }
  }

  async function submitAssign() {
    setError(null);
    setAssignBusy(true);
    try {
      await assignTicket(id, techId || null);
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to assign technician");
    } finally {
      setAssignBusy(false);
    }
  }

  useEffect(() => {
    // Keep technician status select valid (techs only choose RESOLVED / NOT_RESOLVED).
    if (!data) return;
    if (user?.role !== "TECHNICIAN") return;
    const t = data.ticket;
    const isOwnerTech = t.assignedTechnician?.id === user?.id;
    const canTechResolve = isOwnerTech && t.status === "IN_PROGRESS";
    if (!canTechResolve) return;
    if (status !== "RESOLVED" && status !== "NOT_RESOLVED") setStatus("RESOLVED");
  }, [data, user?.role, user?.id, status]);

  if (!data) return null;

  const t = data.ticket;
  const isClosed = t.status === "RESOLVED" || t.status === "NOT_RESOLVED";
  const canStaff = user?.role === "TECHNICIAN" || user?.role === "ADMIN";
  const canAssign = user?.role === "ADMIN";
  const canTake = canStaff && t.status === "OPEN" && !t.assignedTechnician?.id;
  const isTech = user?.role === "TECHNICIAN";
  const isOwnerTech = isTech && t.assignedTechnician?.id === user?.id;
  const canTechResolve = isOwnerTech && t.status === "IN_PROGRESS";

  const listPath = user?.role === "EMPLOYEE" ? "/employee/tickets" : user?.role === "TECHNICIAN" ? "/technician" : "/admin";

  return (
    <div className="space-y-4">
      <nav className="text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
        <Link to={listPath} className="hover:text-primary-600 dark:hover:text-primary-400 hover:underline">
          Tickets
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-gray-700 dark:text-gray-300">#{t.ticketNumber}</span>
      </nav>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ticket #{t.ticketNumber}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.subject}</p>
        </div>
        <div className="flex gap-2">
          <PriorityChip priority={t.priority} />
          <StatusChip status={t.status} />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Details</h2>
            <dl className="space-y-2 text-sm">
              <div><dt className="font-medium text-gray-500 dark:text-gray-400">Category</dt><dd>{t.category || "—"}</dd></div>
              <div><dt className="font-medium text-gray-500 dark:text-gray-400">Created by</dt><dd>{t.createdBy.name}</dd></div>
              <div><dt className="font-medium text-gray-500 dark:text-gray-400">Assigned IT support</dt><dd>{t.assignedTechnician?.name || "—"}</dd></div>
              <div><dt className="font-medium text-gray-500 dark:text-gray-400">Created</dt><dd>{new Date(t.createdAt).toLocaleString()}</dd></div>
              <div><dt className="font-medium text-gray-500 dark:text-gray-400">Description</dt><dd className="mt-1 whitespace-pre-wrap">{t.description}</dd></div>
            </dl>
          </div>

          <div className="card p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Conversation</h2>
            <ul className="space-y-3 mb-4">
              {data.replies.map((r) => (
                <li key={r.id} className="p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">{r.authorName}</span>
                    <span className="text-xs px-2 py-0.5 rounded border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-400">{r.authorRole}</span>
                    {r.isInternal && <span className="text-xs px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">Internal</span>}
                    <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(r.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">{r.message}</p>
                </li>
              ))}
            </ul>
            {!data.replies.length && <p className="text-sm text-gray-500 dark:text-gray-400">No replies yet.</p>}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 space-y-2">
              {isClosed ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">This ticket is closed. Replies are closed.</p>
              ) : (
                <>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Write a reply..."
                    className="input-field"
                  />
                  {canStaff && (
                    <select
                      value={isInternal ? "INTERNAL" : "PUBLIC"}
                      onChange={(e) => setIsInternal(e.target.value === "INTERNAL")}
                      className="input-field max-w-xs"
                    >
                      <option value="PUBLIC">Public (User can see)</option>
                      <option value="INTERNAL">Internal note (Staff only)</option>
                    </select>
                  )}
                  <button type="button" onClick={submitReply} disabled={!message.trim()} className="btn-primary">
                    Send Reply
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {canTake && (
            <div className="card p-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Take ticket</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">This ticket is open and unassigned. Take it to work on it.</p>
              <button type="button" onClick={submitTake} disabled={takeBusy} className="btn-primary w-full">
                {takeBusy ? "Taking…" : "Take"}
              </button>
            </div>
          )}
          {canAssign && (
            <div className="card p-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Assignment</h2>
              {isClosed ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">This ticket is closed. Assignment cannot be changed.</p>
              ) : (
                <>
                  <select value={techId} onChange={(e) => setTechId(e.target.value)} className="input-field mb-3">
                    <option value="">—</option>
                    {techs.map((tt) => (
                      <option key={tt.id} value={tt.id}>
                        {tt.fullName} {!tt.isAvailable ? "(Unavailable)" : ""} {!tt.isActive ? "(Inactive)" : ""}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={submitAssign} disabled={assignBusy} className="btn-primary w-full">
                    {assignBusy ? "Saving..." : "Save Assignment"}
                  </button>
                </>
              )}
            </div>
          )}
          {canStaff && (
            <div className="card p-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Status</h2>
              {isClosed ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">This ticket is closed and cannot be edited.</p>
              ) : (
                <>
                  {isTech && !isOwnerTech ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Only the IT Support who took this ticket can resolve it.
                    </p>
                  ) : isTech && !canTechResolve ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Take the ticket first. You can resolve it after it is in progress.
                    </p>
                  ) : (
                    <>
                      <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field mb-3">
                        {user?.role === "ADMIN" ? (
                          <>
                            <option value="OPEN">Open</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="NOT_RESOLVED">Not Resolved</option>
                          </>
                        ) : (
                          <>
                            <option value="RESOLVED">Resolved</option>
                            <option value="NOT_RESOLVED">Not Resolved</option>
                          </>
                        )}
                      </select>
                      <button type="button" onClick={submitStatus} className="btn-primary w-full">
                        Save Status
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          )}
          <TicketTimeline events={data.timeline} />
        </div>
      </div>
    </div>
  );
}
