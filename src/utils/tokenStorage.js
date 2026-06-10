// Abstracts where the session is stored.
// remember=true  → localStorage  (survives browser close)
// remember=false → sessionStorage (cleared when tab/browser closes)

const KEY_TOKEN = 'winalott_token';
const KEY_USER  = 'winalott_user';

export function getToken() {
  return localStorage.getItem(KEY_TOKEN) || sessionStorage.getItem(KEY_TOKEN) || null;
}

export function setToken(token, remember = true) {
  const keep = remember ? localStorage : sessionStorage;
  const drop = remember ? sessionStorage : localStorage;
  keep.setItem(KEY_TOKEN, token);
  drop.removeItem(KEY_TOKEN);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(KEY_USER) || sessionStorage.getItem(KEY_USER);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setStoredUser(user, remember = true) {
  const keep = remember ? localStorage : sessionStorage;
  const drop = remember ? sessionStorage : localStorage;
  keep.setItem(KEY_USER, JSON.stringify(user));
  drop.removeItem(KEY_USER);
}

export function clearSession() {
  localStorage.removeItem(KEY_TOKEN);
  localStorage.removeItem(KEY_USER);
  sessionStorage.removeItem(KEY_TOKEN);
  sessionStorage.removeItem(KEY_USER);
}

// Returns true if the current session was stored in localStorage (remembered)
export function isRemembered() {
  return !!localStorage.getItem(KEY_TOKEN);
}
