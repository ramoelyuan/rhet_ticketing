import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { listEmployees, createEmployee, toggleUserActive } from "../../services/admin";

export default function EmployeeManagement() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await listEmployees();
    setRows(res.employees || []);
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  function openModal() {
    setFullName("");
    setEmail("");
    setPassword("");
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
    setBusy(true);
    try {
      await createEmployee({ fullName: trimmedName, email: trimmedEmail, password });
      setMsg({ type: "success", text: "Employee created." });
      setFullName("");
      setEmail("");
      setPassword("");
      setModalOpen(false);
      await load();
    } catch (err) {
      const data = err?.response?.data;
      setMsg({ type: "error", text: data?.error || "Failed to create employee" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Employee Management</h1>
        <button type="button" onClick={openModal} className="btn-primary">
          Add employee
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
      {modalOpen &&
        createPortal(
          <>
            <div
              className="bg-black/40"
              style={{ position: "absolute", inset: 0, zIndex: 1 }}
              onClick={() => !busy && setModalOpen(false)}
              aria-hidden
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-employee-title"
              className="rounded-lg bg-white dark:bg-slate-800 p-5 shadow-xl border border-indigo-100 dark:border-slate-700 w-full max-w-md"
              style={{ position: "relative", zIndex: 2, pointerEvents: "auto" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="add-employee-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add employee</h2>
              <form onSubmit={onCreate} className="space-y-3">
                <div>
                  <label htmlFor="emp-fullname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full name (min 2 characters)</label>
                  <input
                    id="emp-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field w-full"
                    minLength={2}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="emp-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    id="emp-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="emp-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Temporary password (min 6 characters)</label>
                  <input
                    id="emp-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field w-full"
                    minLength={6}
                    required
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={busy} className="btn-primary flex-1">
                    {busy ? "Adding..." : "Add employee"}
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
      <div className="card p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Employees</h2>
        <ul className="space-y-2">
          {rows.map((e) => (
            <li
              key={e.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg border border-gray-200 dark:border-slate-700"
            >
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{e.fullName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{e.email}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Active: {e.isActive ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => toggleUserActive(e.id).then(load)}
                  className={`text-sm py-1.5 px-3 rounded-lg font-medium ${
                    e.isActive
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-200"
                      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200"
                  }`}
                >
                  {e.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            </li>
          ))}
          {!rows.length && (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4">No employees.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
