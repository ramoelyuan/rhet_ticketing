import React, { useEffect, useState } from "react";
import { listEmployees, createEmployee, toggleUserActive } from "../../services/admin";

export default function EmployeeManagement() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function load() {
    const res = await listEmployees();
    setRows(res.employees || []);
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

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
    try {
      await createEmployee({ fullName: trimmedName, email: trimmedEmail, password });
      setMsg({ type: "success", text: "Employee created." });
      setFullName("");
      setEmail("");
      setPassword("");
      await load();
    } catch (err) {
      const data = err?.response?.data;
      setMsg({ type: "error", text: data?.error || "Failed to create employee" });
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Employee Management</h1>
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Employee</h2>
        <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4">
            <input
              type="text"
              placeholder="Full name (min 2 characters)"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
              minLength={2}
              required
            />
          </div>
          <div className="md:col-span-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div className="md:col-span-3">
            <input
              type="password"
              placeholder="Temp password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              minLength={6}
              required
            />
          </div>
          <div className="md:col-span-1">
            <button type="submit" className="btn-primary w-full">
              Add
            </button>
          </div>
        </form>
      </div>
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
