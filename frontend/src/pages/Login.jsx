import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const user = await login(email, password);
      if (user.role === "EMPLOYEE") nav("/employee", { replace: true });
      else if (user.role === "TECHNICIAN") nav("/technician", { replace: true });
      else nav("/admin", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[22rem]">
        <div className="text-center mb-8">
          <img src="/logo/rhetlogo.png" alt="Rhet" className="h-[4.75rem] w-auto mx-auto mb-4 object-contain" />
          <p className="text-xl font-bold text-slate-600 dark:text-gray-300 max-w-xs mx-auto">
            RHET Ticketing System
          </p>
        </div>
        <div className="card p-6 sm:p-8 shadow-xl shadow-indigo-950/10 dark:shadow-none">
          <h2 className="text-lg font-semibold text-[#1e3a5f] dark:text-white mb-5">
            Sign in to your account
          </h2>
          <form onSubmit={onSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2.5 text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-500" aria-hidden />
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">
                Work email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@company.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" disabled={busy} className="btn-primary w-full py-3 mt-1 font-medium rounded-xl">
              {busy ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-gray-500">
          Use your work credentials to access the portal.
        </p>
      </div>
    </div>
  );
}
