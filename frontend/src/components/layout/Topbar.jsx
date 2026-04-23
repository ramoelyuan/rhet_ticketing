import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bars3Icon,
  ChevronDownIcon,
  KeyIcon,
  MoonIcon,
  SunIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../hooks/useAuth";
import { useColorMode } from "../../hooks/useColorMode";
import {
  changePassword as changePasswordApi,
  deleteProfileAvatar,
  updateProfile,
  uploadProfileAvatar,
} from "../../services/auth";
import PasswordField from "../PasswordField";
import { DEPARTMENTS } from "../../constants/departments";
import { resolveMediaUrl } from "../../utils/mediaUrl";

function roleDisplayLabel(role) {
  if (role === "ADMIN") return "IT Admin";
  if (role === "EMPLOYEE") return "IT Employee";
  if (role === "TECHNICIAN") return "IT Support";
  return role;
}

export default function Topbar({ onMenu }) {
  const { user, logout, setUser } = useAuth();
  const { mode, toggleMode } = useColorMode();
  const displayName = user ? (user.fullName || roleDisplayLabel(user.role)) : "";
  const roleLabel = user ? roleDisplayLabel(user.role) : "";
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null);
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const profileMenuRef = useRef(null);

  const remoteAvatarSrc =
    user?.avatarUrl && !avatarPreviewUrl ? resolveMediaUrl(user.avatarUrl) : null;
  const avatarSrc = avatarPreviewUrl || remoteAvatarSrc;
  /** Remote 404/CORS falls back to initials; local file preview always shows the blob. */
  const showAvatarImage =
    Boolean(avatarPreviewUrl) || (!!remoteAvatarSrc && !avatarLoadError);

  useEffect(() => {
    setAvatarLoadError(false);
  }, [user?.avatarUrl]);

  useEffect(() => {
    if (avatarPreviewUrl) setAvatarLoadError(false);
  }, [avatarPreviewUrl]);

  useEffect(() => {
    if (!profileOpen) return;
    function handlePointerDown(e) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    function handleEscape(e) {
      if (e.key === "Escape") setProfileOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [profileOpen]);

  function openEditProfileModal() {
    setProfileOpen(false);
    setProfileModalOpen(true);
    setEditFullName(user?.fullName || "");
    setEditDepartment(user?.department || "");
    setAvatarFile(null);
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
      setAvatarPreviewUrl(null);
    }
    setProfileError("");
  }

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

  async function submitProfile(e) {
    e.preventDefault();
    setProfileError("");
    const name = editFullName.trim();
    if (name.length < 2) {
      setProfileError("Name must be at least 2 characters.");
      return;
    }
    setProfileBusy(true);
    try {
      const pr = await updateProfile({
        fullName: name,
        department: editDepartment || null,
      });
      setUser(pr.user);
      if (avatarFile) {
        const ur = await uploadProfileAvatar(avatarFile);
        setUser(ur.user);
        setAvatarFile(null);
        if (avatarPreviewUrl) {
          URL.revokeObjectURL(avatarPreviewUrl);
          setAvatarPreviewUrl(null);
        }
      }
      setProfileModalOpen(false);
    } catch (err) {
      setProfileError(err?.response?.data?.error || "Failed to save profile.");
    } finally {
      setProfileBusy(false);
    }
  }

  async function removeProfilePhoto() {
    setProfileError("");
    setProfileBusy(true);
    try {
      const res = await deleteProfileAvatar();
      setUser(res.user);
      setAvatarFile(null);
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
        setAvatarPreviewUrl(null);
      }
    } catch (err) {
      setProfileError(err?.response?.data?.error || "Failed to remove photo.");
    } finally {
      setProfileBusy(false);
    }
  }

  function onAvatarFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\/(jpeg|png|gif|webp)$/i.test(f.type)) {
      setProfileError("Please choose a JPEG, PNG, GIF, or WebP image.");
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setProfileError("Image must be 2 MB or smaller.");
      return;
    }
    setProfileError("");
    setAvatarFile(f);
    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    setAvatarPreviewUrl(URL.createObjectURL(f));
  }

  return (
    <header className="flex h-full w-full items-center px-4 gap-3 bg-[#0a2e3c] backdrop-blur-md border-b border-black/10 shadow-none">
      <button
        type="button"
        onClick={onMenu}
        className="md:hidden p-2 rounded-lg text-[#839bb0] hover:bg-white/10"
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
            className="p-2 rounded-lg text-[#839bb0] hover:bg-white/10"
            aria-label={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {mode === "light" ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
          </button>
          <span className="hidden sm:inline-flex items-center rounded-md border border-white/20 px-2 py-0.5 text-xs font-medium text-white/80">
            {roleLabel}
          </span>
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg py-1.5 pl-1 pr-2 text-left hover:bg-white/10 transition-colors"
            >
              {showAvatarImage ? (
                <img
                  src={avatarSrc}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-white/25 shrink-0"
                  onError={() => setAvatarLoadError(true)}
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-medium shrink-0">
                  {displayName?.[0] || "A"}
                </span>
              )}
              <span className="hidden sm:block text-sm text-white/80 max-w-[120px] truncate">
                {displayName}
              </span>
              <ChevronDownIcon className="w-4 h-4 text-white/70" />
            </button>
            {profileOpen && (
              <>
                <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-indigo-100 dark:border-slate-700 py-1">
                  <div className="px-3 py-2 text-sm text-slate-500 dark:text-gray-400 truncate border-b border-indigo-50 dark:border-slate-700">
                    {user.email}
                  </div>
                  <button
                    type="button"
                    onClick={openEditProfileModal}
                    className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-gray-300 hover:bg-indigo-50/80 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <UserCircleIcon className="w-4 h-4" />
                    Edit profile
                  </button>
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

      {profileModalOpen &&
        createPortal(
          <>
            <div
              className="bg-black/40 backdrop-blur-sm"
              style={{ position: "absolute", inset: 0, zIndex: 1 }}
              onClick={() => {
                if (!profileBusy) {
                  setProfileModalOpen(false);
                  if (avatarPreviewUrl) {
                    URL.revokeObjectURL(avatarPreviewUrl);
                    setAvatarPreviewUrl(null);
                  }
                  setAvatarFile(null);
                }
              }}
              aria-hidden
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-profile-title"
              className="rounded-lg shadow-xl border border-indigo-100 dark:border-slate-700 p-5 overflow-y-auto w-full max-w-md bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
              style={{
                maxHeight: "min(100vh - 2rem, 32rem)",
                boxSizing: "border-box",
                position: "relative",
                zIndex: 2,
                pointerEvents: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="edit-profile-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Edit profile
              </h2>
              <form onSubmit={submitProfile} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    {showAvatarImage ? (
                      <img
                        src={avatarSrc}
                        alt=""
                        className="h-20 w-20 rounded-full object-cover ring-2 ring-gray-200 dark:ring-slate-600"
                        onError={() => setAvatarLoadError(true)}
                      />
                    ) : (
                      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white text-2xl font-medium">
                        {(editFullName || displayName)?.[0] || "?"}
                      </span>
                    )}
                    <label className="text-xs font-medium text-primary-600 dark:text-primary-400 cursor-pointer hover:underline">
                      Change photo
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="sr-only"
                        onChange={onAvatarFileChange}
                        disabled={profileBusy}
                      />
                    </label>
                    {(user?.avatarUrl || avatarFile) && (
                      <button
                        type="button"
                        onClick={() => {
                          if (avatarFile) {
                            setAvatarFile(null);
                            if (avatarPreviewUrl) {
                              URL.revokeObjectURL(avatarPreviewUrl);
                              setAvatarPreviewUrl(null);
                            }
                          } else {
                            removeProfilePhoto();
                          }
                        }}
                        disabled={profileBusy}
                        className="text-xs text-red-600 dark:text-red-400 hover:underline"
                      >
                        {avatarFile ? "Cancel new photo" : "Remove photo"}
                      </button>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-3 w-full">
                    <div>
                      <label htmlFor="profile-fullname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full name
                      </label>
                      <input
                        id="profile-fullname"
                        type="text"
                        value={editFullName}
                        onChange={(e) => setEditFullName(e.target.value)}
                        className="input-field w-full"
                        minLength={2}
                        required
                        disabled={profileBusy}
                        autoComplete="name"
                      />
                    </div>
                    <div>
                      <label htmlFor="profile-department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Department
                      </label>
                      <select
                        id="profile-department"
                        value={editDepartment}
                        onChange={(e) => setEditDepartment(e.target.value)}
                        className="input-field w-full"
                        disabled={profileBusy}
                      >
                        <option value="">— Not set —</option>
                        {DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                {profileError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{profileError}</p>
                )}
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={profileBusy} className="btn-primary flex-1">
                    {profileBusy ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileModalOpen(false);
                      if (avatarPreviewUrl) {
                        URL.revokeObjectURL(avatarPreviewUrl);
                        setAvatarPreviewUrl(null);
                      }
                      setAvatarFile(null);
                    }}
                    disabled={profileBusy}
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
              <h2 id="change-password-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Change password
              </h2>
              {passwordSuccess ? (
                <p className="text-sm text-green-600 dark:text-green-400">Password changed successfully.</p>
              ) : (
                <form onSubmit={submitChangePassword} className="space-y-3">
                  <PasswordField
                    id="current-password"
                    label="Current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    disabled={passwordBusy}
                  />
                  <PasswordField
                    id="new-password"
                    label="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    disabled={passwordBusy}
                  />
                  <PasswordField
                    id="confirm-password"
                    label="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    disabled={passwordBusy}
                  />
                  {passwordError && <p className="text-sm text-red-600 dark:text-red-400">{passwordError}</p>}
                  <div className="flex gap-2 pt-1">
                    <button type="submit" disabled={passwordBusy} className="btn-primary flex-1">
                      {passwordBusy ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPasswordModalOpen(false)}
                      disabled={passwordBusy}
                      className="btn-secondary"
                    >
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
