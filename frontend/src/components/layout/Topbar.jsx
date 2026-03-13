import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  Bars3Icon,
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
  const displayName = user ? (user.fullName || roleDisplayLabel(user.role)) : "";
  const roleLabel = user ? roleDisplayLabel(user.role) : "";
  const { mode, toggleMode } = useColorMode();
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);

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

  return (
    <header className="sticky top-0 z-50 flex items-center h-16 px-4 gap-3 bg-[#f0f4ff]/95 dark:bg-slate-900 backdrop-blur-md border-b border-indigo-200/70 dark:border-slate-800 shadow-sm shadow-indigo-950/5 dark:shadow-none">
      <button
        type="button"
        onClick={onMenu}
        className="md:hidden p-2 rounded-lg text-slate-600 dark:text-gray-400 hover:bg-indigo-100/80 dark:hover:bg-slate-800"
        aria-label="Open menu"
      >
        <Bars3Icon className="w-6 h-6" />
      </button>
      <div className="flex-1" />
      {user && (
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={toggleMode}
className="p-2 rounded-lg text-slate-600 hover:bg-indigo-100/80 dark:hover:bg-slate-800 dark:text-gray-400"
          aria-label="Toggle theme"
          >
            {mode === "light" ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
          </button>
          <span className="hidden sm:inline-flex items-center rounded-md border border-indigo-200 dark:border-slate-600 px-2 py-0.5 text-xs font-medium text-[#1e3a5f] dark:text-gray-300">
            {roleLabel}
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg py-1.5 pl-1 pr-2 text-left hover:bg-indigo-100/80 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-medium">
                {displayName?.[0] || "A"}
              </span>
              <span className="hidden sm:block text-sm text-slate-600 dark:text-gray-400 max-w-[120px] truncate">
                {displayName}
              </span>
              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
            </button>
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} aria-hidden />
                <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-indigo-100 dark:border-slate-700 py-1">
                  <div className="px-3 py-2 text-sm text-slate-500 dark:text-gray-400 truncate border-b border-indigo-50 dark:border-slate-700">
                    {user.email}
                  </div>
                  <button
                    type="button"
                    onClick={openPasswordModal}
                    className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-gray-300 hover:bg-indigo-50/80 dark:hover:bg-slate-700 flex items-center gap-2"
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
                    className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-gray-300 hover:bg-indigo-50/80 dark:hover:bg-slate-700"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Change password modal - rendered into #modal-root; backdrop closes only when clicking overlay, not the dialog */}
      {passwordModalOpen &&
        createPortal(
          <>
            <div
              className="bg-black/40 backdrop-blur-sm"
              style={{ position: "absolute", inset: 0, zIndex: 1 }}
              onClick={() => !passwordBusy && setPasswordModalOpen(false)}
              aria-hidden
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="change-password-title"
              className="rounded-lg shadow-xl border border-indigo-100 dark:border-slate-700 p-5 overflow-y-auto w-full max-w-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
              style={{
                maxHeight: "min(100vh - 2rem, 28rem)",
                boxSizing: "border-box",
                position: "relative",
                zIndex: 2,
                pointerEvents: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
                <h2 id="change-password-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change password</h2>
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
          </>,
          document.getElementById("modal-root") || document.body
        )}
    </header>
  );
}
