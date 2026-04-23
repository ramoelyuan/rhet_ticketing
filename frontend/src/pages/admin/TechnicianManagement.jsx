import React, { useMemo, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Loading from "../../components/Loading";
import PasswordField from "../../components/PasswordField";
import Pagination from "../../components/Pagination";
import {
  createTechnician,
  listTechnicians,
  toggleUserActive,
  updateManagedUser,
} from "../../services/admin";

export default function TechnicianManagement() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [msg, setMsg] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editIsAvailable, setEditIsAvailable] = useState(true);
  const [editPassword, setEditPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [editBusy, setEditBusy] = useState(false);
  const pageSize = 10;

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((t) => (t.fullName || "").toLowerCase().includes(q));
  }, [rows, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const total = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, safePage]);

  async function load() {
    setLoading(true);
    try {
      const res = await listTechnicians();
      setRows(res.technicians || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  function openModal() {
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setMsg(null);
    setModalOpen(true);
  }

  async function onCreate(e) {
    e.preventDefault();
    setMsg(null);
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedName.length < 2) {
      setMsg({ type: "error", text: "Full name must be at least 2 characters." });
      return;
    }
    if (!trimmedEmail) {
      setMsg({ type: "error", text: "Email is required." });
      return;
    }
    if (password.length < 6) {
      setMsg({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    if (password !== confirmPassword) {
      setMsg({ type: "error", text: "Passwords do not match." });
      return;
    }
    setBusy(true);
    try {
      await createTechnician({ fullName: trimmedName, email: trimmedEmail, password });
      setMsg({ type: "success", text: "IT support created." });
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setModalOpen(false);
      await load();
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.error || "Failed to create IT support" });
    } finally {
      setBusy(false);
    }
  }

  function openEditModal(row) {
    setEditRow(row);
    setEditFullName(row.fullName || "");
    setEditEmail(row.email || "");
    setEditIsAvailable(!!row.isAvailable);
    setEditPassword("");
    setEditConfirmPassword("");
    setMsg(null);
    setEditModalOpen(true);
  }

  async function onEditSubmit(e) {
    e.preventDefault();
    setMsg(null);
    if (!editRow) return;
    const trimmedName = editFullName.trim();
    const trimmedEmail = editEmail.trim().toLowerCase();
    if (trimmedName.length < 2) {
      setMsg({ type: "error", text: "Full name must be at least 2 characters." });
      return;
    }
    if (!trimmedEmail) {
      setMsg({ type: "error", text: "Email is required." });
      return;
    }
    if (editPassword || editConfirmPassword) {
      if (editPassword.length < 6) {
        setMsg({ type: "error", text: "New password must be at least 6 characters." });
        return;
      }
      if (editPassword !== editConfirmPassword) {
        setMsg({ type: "error", text: "Passwords do not match." });
        return;
      }
    }
    setEditBusy(true);
    try {
      const body = {
        fullName: trimmedName,
        email: trimmedEmail,
        isAvailable: editIsAvailable,
      };
      if (editPassword) body.password = editPassword;
      await updateManagedUser(editRow.id, body);
      setMsg({ type: "success", text: "IT support updated." });
      setEditModalOpen(false);
      setEditRow(null);
      await load();
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.error || "Failed to update IT support." });
    } finally {
      setEditBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">IT Support Management</h1>
          <input
            type="search"
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field w-full sm:w-64"
            aria-label="Search IT support by name"
          />
        </div>
        <button type="button" onClick={openModal} className="btn-primary">
          Add IT support
        </button>
      </div>
      {msg && (
        <div
          className={`rounded-lg px-3 py-2 text-sm ${
            msg.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
          }`}
        >
          {msg.text}
        </div>
      )}
      {editModalOpen &&
        createPortal(
          <>
            <div
              className="bg-black/40 backdrop-blur-sm"
              style={{ position: "absolute", inset: 0, zIndex: 1 }}
              onClick={() => !editBusy && setEditModalOpen(false)}
              aria-hidden
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-tech-title"
              className="rounded-lg bg-white dark:bg-slate-800 p-5 shadow-xl border border-indigo-100 dark:border-slate-700 w-full max-w-md"
              style={{ position: "relative", zIndex: 2, pointerEvents: "auto" }}
              onClick={(ev) => ev.stopPropagation()}
            >
              <h2 id="edit-tech-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Edit IT support
              </h2>
              <form onSubmit={onEditSubmit} className="space-y-3">
                <div>
                  <label htmlFor="edit-tech-fullname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full name (min 2 characters)
                  </label>
                  <input
                    id="edit-tech-fullname"
                    type="text"
                    value={editFullName}
                    onChange={(ev) => setEditFullName(ev.target.value)}
                    className="input-field w-full"
                    minLength={2}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="edit-tech-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    id="edit-tech-email"
                    type="email"
                    value={editEmail}
                    onChange={(ev) => setEditEmail(ev.target.value)}
                    className="input-field w-full"
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="edit-tech-available"
                    type="checkbox"
                    checked={editIsAvailable}
                    onChange={(ev) => setEditIsAvailable(ev.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="edit-tech-available" className="text-sm text-gray-700 dark:text-gray-300">
                    Available for new assignments
                  </label>
                </div>
                <PasswordField
                  id="edit-tech-password"
                  label="New password (optional, min 6 characters)"
                  value={editPassword}
                  onChange={(ev) => setEditPassword(ev.target.value)}
                  autoComplete="new-password"
                />
                <PasswordField
                  id="edit-tech-password-confirm"
                  label="Confirm new password"
                  value={editConfirmPassword}
                  onChange={(ev) => setEditConfirmPassword(ev.target.value)}
                  autoComplete="new-password"
                />
                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={editBusy} className="btn-primary flex-1">
                    {editBusy ? "Saving..." : "Save changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => !editBusy && setEditModalOpen(false)}
                    disabled={editBusy}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </>,
          document.getElementById("modal-root") || document.body
        )}
      {modalOpen &&
        createPortal(
          <>
            <div
              className="bg-black/40 backdrop-blur-sm"
              style={{ position: "absolute", inset: 0, zIndex: 1 }}
              onClick={() => !busy && setModalOpen(false)}
              aria-hidden
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-tech-title"
              className="rounded-lg bg-white dark:bg-slate-800 p-5 shadow-xl border border-indigo-100 dark:border-slate-700 w-full max-w-md"
              style={{ position: "relative", zIndex: 2, pointerEvents: "auto" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="add-tech-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add IT support</h2>
              <form onSubmit={onCreate} className="space-y-3">
                <div>
                  <label htmlFor="tech-fullname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full name (min 2 characters)</label>
                  <input
                    id="tech-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field w-full"
                    minLength={2}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="tech-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    id="tech-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field w-full"
                    required
                  />
                </div>
                <PasswordField
                  id="tech-password"
                  label="Temporary password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  autoComplete="new-password"
                />
                <PasswordField
                  id="tech-password-confirm"
                  label="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                  autoComplete="new-password"
                />
                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={busy} className="btn-primary flex-1">
                    {busy ? "Adding..." : "Add IT support"}
                  </button>
                  <button type="button" onClick={() => !busy && setModalOpen(false)} disabled={busy} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </>,
          document.getElementById("modal-root") || document.body
        )}
      {loading ? (
        <div className="card min-h-48 flex items-center justify-center">
          <Loading />
        </div>
      ) : (
      <div className="card p-5">
        <ul className="space-y-2">
          {pagedRows.map((t) => (
            <li
              key={t.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg border border-gray-200 dark:border-slate-700"
            >
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{t.fullName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.email}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Active: {t.isActive ? "Yes" : "No"} • Available: {t.isAvailable ? "Yes" : "No"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 items-center shrink-0">
                <button
                  type="button"
                  onClick={() => openEditModal(t)}
                  className="text-sm py-1.5 px-3 rounded-lg font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => toggleUserActive(t.id).then(load)}
                  className={`text-sm py-1.5 px-3 rounded-lg font-medium ${
                    t.isActive
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-200"
                      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200"
                  }`}
                >
                  {t.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            </li>
          ))}
          {!pagedRows.length && (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4">
              {rows.length ? "No IT support matches your search." : "No IT supports."}
            </p>
          )}
        </ul>
        <div className="mt-4">
          <Pagination page={safePage} pageSize={pageSize} total={total} onChange={setPage} />
        </div>
      </div>
      )}
    </div>
  );
}
