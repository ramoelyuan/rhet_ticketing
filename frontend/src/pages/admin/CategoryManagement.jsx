import React, { useEffect, useState } from "react";
import { createCategory, listCategories, toggleCategory } from "../../services/admin";

export default function CategoryManagement() {
  const [rows, setRows] = useState([]);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState(null);

  async function load() {
    const res = await listCategories();
    setRows(res.categories || []);
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    setMsg(null);
    try {
      await createCategory(name);
      setName("");
      setMsg({ type: "success", text: "Category created." });
      await load();
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.error || "Failed to create category" });
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Category Management</h1>
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
      <div className="card p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Category</h2>
        <form onSubmit={onCreate} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field flex-1"
          />
          <button type="submit" className="btn-primary shrink-0">
            Add
          </button>
        </form>
      </div>
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
