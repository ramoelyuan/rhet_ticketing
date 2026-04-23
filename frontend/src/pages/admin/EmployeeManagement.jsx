import React, { useMemo, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Loading from "../../components/Loading";
import PasswordField from "../../components/PasswordField";
import Pagination from "../../components/Pagination";
import {
  listEmployees,
  createEmployee,
  toggleUserActive,
  updateManagedUser,
} from "../../services/admin";
import { DEPARTMENTS } from "../../constants/departments";

export default function EmployeeManagement() {
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
  const [department, setDepartment] = useState("");
  const [busy, setBusy] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [editBusy, setEditBusy] = useState(false);
  const pageSize = 10;

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((e) => (e.fullName || "").toLowerCase().includes(q));
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
      const res = await listEmployees();
      setRows(res.employees || []);
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
    setDepartment("");
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
    if (!department) {
      setMsg({ type: "error", text: "Please select a department." });
      return;
    }
    setBusy(true);
    try {
      await createEmployee({ fullName: trimmedName, email: trimmedEmail, password, department });
      setMsg({ type: "success", text: "Employee created." });
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setDepartment("");
      setModalOpen(false);
      await load();
    } catch (err) {
      const data = err?.response?.data;
      setMsg({ type: "error", text: data?.error || "Failed to create employee" });
    } finally {
      setBusy(false);
    }
  }

  function openEditModal(row) {
    setEditRow(row);
    setEditFullName(row.fullName || "");
    setEditEmail(row.email || "");
    setEditDepartment(row.department || "");
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
    if (!editDepartment) {
      setMsg({ type: "error", text: "Please select a department." });
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
        department: editDepartment,
      };
      if (editPassword) body.password = editPassword;
      await updateManagedUser(editRow.id, body);
      setMsg({ type: "success", text: "Employee updated." });
      setEditModalOpen(false);
      setEditRow(null);
      await load();
    } catch (err) {
      const data = err?.response?.data;
      setMsg({ type: "error", text: data?.error || "Failed to update employee." });
    } finally {
      setEditBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Employee Management</h1>
          <input
            type="search"
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field w-full sm:w-64"
            aria-label="Search employees by name"
          />
        </div>
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
      {loading ? (
        <div className="card min-h-48 flex items-center justify-center">
          <Loading />
        </div>
      ) : (
      <div className="card p-5">
        <ul className="space-y-2">
          {pagedRows.map((e) => (
            <li
              key={e.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg border border-gray-200 dark:border-slate-700"
            >
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{e.fullName}</p>
                {e.department ? (
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">{e.department}</p>
                ) : null}
                <p className="text-sm text-gray-500 dark:text-gray-400">{e.email}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Active: {e.isActive ? "Yes" : "No"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 items-center shrink-0">
                <button
                  type="button"
                  onClick={() => openEditModal(e)}
                  className="text-sm py-1.5 px-3 rounded-lg font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => toggleUserActive(e.id, !e.isActive).then(() => load()).catch(() => {})}
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
          {!pagedRows.length && (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4">
              {rows.length ? "No employees match your search." : "No employees."}
            </p>
          )}
        </ul>
        <div className="mt-4">
          <Pagination page={safePage} pageSize={pageSize} total={total} onChange={setPage} />
        </div>
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
              aria-labelledby="edit-employee-title"
              className="rounded-lg bg-white dark:bg-slate-800 p-5 shadow-xl border border-indigo-100 dark:border-slate-700 w-full max-w-md"
              style={{ position: "relative", zIndex: 2, pointerEvents: "auto" }}
              onClick={(ev) => ev.stopPropagation()}
            >
              <h2 id="edit-employee-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Edit employee
              </h2>
              <form onSubmit={onEditSubmit} className="space-y-3" autoComplete="off">
                <div>
                  <label htmlFor="edit-emp-fullname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full name (min 2 characters)
                  </label>
                  <input
                    id="edit-emp-fullname"
                    type="text"
                    value={editFullName}
                    onChange={(ev) => setEditFullName(ev.target.value)}
                    className="input-field w-full"
                    minLength={2}
                    required
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label htmlFor="edit-emp-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    id="edit-emp-email"
                    type="email"
                    value={editEmail}
                    onChange={(ev) => setEditEmail(ev.target.value)}
                    className="input-field w-full"
                    required
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label htmlFor="edit-emp-department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Department
                  </label>
                  <select
                    id="edit-emp-department"
                    value={editDepartment}
                    onChange={(ev) => setEditDepartment(ev.target.value)}
                    className="input-field w-full"
                    required
                  >
                    <option value="">Select department…</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <PasswordField
                  id="edit-emp-password"
                  label="New password (optional, min 6 characters)"
                  value={editPassword}
                  onChange={(ev) => setEditPassword(ev.target.value)}
                  autoComplete="new-password"
                />
                <PasswordField
                  id="edit-emp-password-confirm"
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
              aria-labelledby="add-employee-title"
              className="rounded-lg bg-white dark:bg-slate-800 p-5 shadow-xl border border-indigo-100 dark:border-slate-700 w-full max-w-md"
              style={{ position: "relative", zIndex: 2, pointerEvents: "auto" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="add-employee-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add employee</h2>
              <form onSubmit={onCreate} className="space-y-3" autoComplete="off">
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
                    autoComplete="off"
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
                    autoComplete="off"
                  />
                </div>
                <PasswordField
                  id="emp-password"
                  label="Temporary password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  autoComplete="new-password"
                />
                <PasswordField
                  id="emp-password-confirm"
                  label="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                  autoComplete="new-password"
                />
                <div>
                  <label htmlFor="emp-department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                  <select
                    id="emp-department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="input-field w-full"
                    required
                  >
                    <option value="">Select department…</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
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
    </div>
  );
}
