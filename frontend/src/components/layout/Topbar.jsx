import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  ChevronDownIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../hooks/useAuth";
import { useColorMode } from "../../hooks/useColorMode";
import { changePassword as changePasswordApi } from "../../services/auth";

function roleDisplayLabel(role) {
  if (role === "ADMIN") return "IT Admin";
  if (role === "EMPLOYEE") return "IT Employee";
  if (role === "TECHNICIAN") return "IT Support";
  return role;
}

export default function Topbar({ onMenu }) {
  const { user, logout } = useAuth();
  const displayName = user ? roleDisplayLabel(user.role) : "";
  const { mode, toggleMode } = useColorMode();
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const nav = useNavigate();

  function openPasswordModal() {
    setProfileOpen(false);
    setPasswordModalOpen(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setPasswordSuccess(false);
  }

  async function submitChangePassword(e) {
    e.preventDefault();
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    setPasswordBusy(true);
    try {
      await changePasswordApi(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setPasswordModalOpen(false);
        setPasswordSuccess(false);
      }, 1500);
    } catch (err) {
      setPasswordError(err?.response?.data?.error || "Failed to change password.");
    } finally {
      setPasswordBusy(false);
    }
  }

  function handleSearchSubmit(e) {
    if (e.key !== "Enter" || !search.trim()) return;
    const term = search.trim();
    if (!user) return;
    if (user.role === "ADMIN") nav(`/admin/tickets?q=${encodeURIComponent(term)}`);
    else if (user.role === "TECHNICIAN") nav(`/technician?q=${encodeURIComponent(term)}`);
    else nav(`/employee/tickets?q=${encodeURIComponent(term)}`);
  }

  return (
    <header className="sticky top-0 z-20 flex items-center h-16 px-4 gap-3 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
      <button
        type="button"
        onClick={onMenu}
        className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
        aria-label="Open menu"
      >
        <Bars3Icon className="w-6 h-6" />
      </button>
      <span className="font-semibold text-gray-900 dark:text-white truncate">
        {user ? "IT Ticketing Workspace" : "Welcome"}
      </span>
      <div className="flex-1 flex justify-center max-w-md">
        {user && (
          <div className="relative w-full">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchSubmit}
              className="input-field w-full pl-10 py-2 rounded-full text-sm"
            />
          </div>
        )}
      </div>
      {user && (
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={toggleMode}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 dark:text-gray-400"
            aria-label="Toggle theme"
          >
            {mode === "light" ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
          </button>
          <span className="hidden sm:inline-flex items-center rounded-md border border-gray-300 dark:border-slate-600 px-2 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300">
            {displayName}
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg py-1.5 pl-1 pr-2 text-left hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-medium">
                {displayName?.[0] || "A"}
              </span>
              <span className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 max-w-[120px] truncate">
                {displayName}
              </span>
              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
            </button>
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} aria-hidden />
                <div className="absolute right-0 top-full mt-1 z-20 w-56 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700 py-1">
                  <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 truncate border-b border-gray-100 dark:border-slate-700">
                    {user.email}
                  </div>
                  <button
                    type="button"
                    onClick={openPasswordModal}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <KeyIcon className="w-4 h-4" />
                    Change password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Change password modal */}
      {passwordModalOpen && (
        <>
          <div className="fixed inset-0 z-30 bg-black/50" onClick={() => !passwordBusy && setPasswordModalOpen(false)} aria-hidden />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-full max-w-sm rounded-lg bg-white dark:bg-slate-800 shadow-xl border border-gray-200 dark:border-slate-700 p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change password</h2>
            {passwordSuccess ? (
              <p className="text-sm text-green-600 dark:text-green-400">Password changed successfully.</p>
            ) : (
              <form onSubmit={submitChangePassword} className="space-y-3">
                <div>
                  <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current password</label>
                  <input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input-field w-full"
                    required
                    autoComplete="current-password"
                  />
                </div>
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New password</label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field w-full"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm new password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field w-full"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                {passwordError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{passwordError}</p>
                )}
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={passwordBusy} className="btn-primary flex-1">
                    {passwordBusy ? "Saving..." : "Save"}
                  </button>
                  <button type="button" onClick={() => setPasswordModalOpen(false)} disabled={passwordBusy} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </header>
  );
}
