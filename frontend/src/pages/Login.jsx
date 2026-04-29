import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import PasswordField from "../components/PasswordField";
import {
  clearLoginLock,
  getLoginLockState,
  recordFailedAttempt,
  remainingLockSeconds,
} from "../utils/loginRateLimit";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(0);

  const lockState = useMemo(() => getLoginLockState(email), [email, tick]);
  const lockSeconds = lockState.locked ? remainingLockSeconds(lockState.until) : 0;

  useEffect(() => {
    if (!lockState.locked) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [lockState.locked, email]);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const lockedNow = getLoginLockState(email);
    if (lockedNow.locked) {
      setError(
        `Too many failed attempts. Try again in ${remainingLockSeconds(lockedNow.until)} seconds.`
      );
      return;
    }
    setBusy(true);
    try {
      const user = await login(email, password);
      clearLoginLock(email);
      if (user.role === "EMPLOYEE") nav("/employee", { replace: true });
      else if (user.role === "TECHNICIAN") nav("/technician", { replace: true });
      else nav("/admin", { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.error || "Login failed";
      if (status === 401) {
        const after = recordFailedAttempt(email);
        setTick((t) => t + 1);
        if (!after.locked) setError(msg);
      } else {
        setError(msg);
      }
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
            {lockState.locked && (
              <div
                className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2.5 text-sm text-amber-900 dark:text-amber-200"
                role="status"
              >
                Too many failed attempts for this email. Try again in{" "}
                <span className="font-semibold tabular-nums">{lockSeconds}</span> seconds.
              </div>
            )}
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
                disabled={lockState.locked}
              />
            </div>
            <PasswordField
              id="password"
              label="Password"
              labelClassName="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              inputClassName="input-field w-full pr-11"
              disabled={lockState.locked}
            />
            <button
              type="submit"
              disabled={busy || lockState.locked}
              className="btn-primary w-full py-3 mt-1 font-medium rounded-xl disabled:opacity-60"
            >
              {busy ? "Signing in..." : lockState.locked ? `Wait ${lockSeconds}s` : "Sign In"}
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
