const STORAGE_KEY = "rhet_login_rate_limit_v1";
const MAX_ATTEMPTS = 5;
const LOCK_MS = 60_000;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveAll(all) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore quota / private mode
  }
}

/**
 * Returns lockout state for this email. Clears expired locks.
 */
export function getLoginLockState(email) {
  const key = normalizeEmail(email);
  if (!key) return { locked: false, until: 0, attempts: 0 };

  const all = loadAll();
  let s = all[key] || { attempts: 0, until: 0 };
  const now = Date.now();

  if (s.until > 0 && now >= s.until) {
    s = { attempts: 0, until: 0 };
    all[key] = s;
    saveAll(all);
  }

  const locked = s.until > 0 && now < s.until;
  return { locked, until: s.until, attempts: s.attempts };
}

/** Call after a failed login (wrong credentials). */
export function recordFailedAttempt(email) {
  const key = normalizeEmail(email);
  if (!key) return getLoginLockState(email);

  const all = loadAll();
  const now = Date.now();
  let s = all[key] || { attempts: 0, until: 0 };

  if (s.until > 0 && now < s.until) {
    return { locked: true, until: s.until, attempts: s.attempts };
  }

  if (s.until > 0 && now >= s.until) {
    s = { attempts: 0, until: 0 };
  }

  s.attempts += 1;
  if (s.attempts >= MAX_ATTEMPTS) {
    s.until = now + LOCK_MS;
    s.attempts = 0;
  }

  all[key] = s;
  saveAll(all);

  return getLoginLockState(email);
}

/** Call after successful login. */
export function clearLoginLock(email) {
  const key = normalizeEmail(email);
  if (!key) return;
  const all = loadAll();
  delete all[key];
  saveAll(all);
}

export function remainingLockSeconds(until) {
  if (!until) return 0;
  const ms = until - Date.now();
  return ms > 0 ? Math.ceil(ms / 1000) : 0;
}
