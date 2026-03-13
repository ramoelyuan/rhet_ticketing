import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { createCategory, listCategories, toggleCategory } from "../../services/admin";

export default function CategoryManagement() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await listCategories();
    setRows(res.categories || []);
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  function openModal() {
    setName("");
    setMsg(null);
    setModalOpen(true);
  }

  async function onCreate(e) {
    e.preventDefault();
    setMsg(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setMsg({ type: "error", text: "Category name is required." });
      return;
    }
    setBusy(true);
    try {
      await createCategory(trimmedName);
      setMsg({ type: "success", text: "Category created." });
      setName("");
      setModalOpen(false);
      await load();
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.error || "Failed to create category" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Category Management</h1>
        <button type="button" onClick={openModal} className="btn-primary">
          Add category
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
              className="bg-black/40 backdrop-blur-sm"
              style={{ position: "absolute", inset: 0, zIndex: 1 }}
              onClick={() => !busy && setModalOpen(false)}
              aria-hidden
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-category-title"
              className="rounded-lg bg-white dark:bg-slate-800 p-5 shadow-xl border border-indigo-100 dark:border-slate-700 w-full max-w-md"
              style={{ position: "relative", zIndex: 2, pointerEvents: "auto" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="add-category-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add category</h2>
              <form onSubmit={onCreate} className="space-y-3">
                <div>
                  <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category name</label>
                  <input
                    id="category-name"
                    type="text"
                    placeholder="e.g. Hardware, Software"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field w-full"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={busy} className="btn-primary flex-1">
                    {busy ? "Adding..." : "Add category"}
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categories</h2>
        <ul className="space-y-2">
          {rows.map((c) => (
            <li
              key={c.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg border border-gray-200 dark:border-slate-700"
            >
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{c.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Active: {c.isActive ? "Yes" : "No"}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleCategory(c.id).then(load)}
                className="btn-secondary text-sm w-fit"
              >
                Toggle Active
              </button>
            </li>
          ))}
          {!rows.length && (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4">No categories.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
