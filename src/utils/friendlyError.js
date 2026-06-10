// Maps technical backend errors to friendly user-facing messages.
// Temporary — replace with production copy when going live.

const DEV_MAP = [
  // Setup / config
  { test: /not configured|env var/i,          msg: "We're still setting things up — please try again in a moment." },
  { test: /service unavailable|503/i,         msg: "We're still setting things up — please try again in a moment." },

  // Auth
  { test: /invalid.*credentials|invalid.*password|wrong password/i, msg: "That email or password doesn't look right. Please try again." },
  { test: /email.*not.*confirmed|confirm your email/i,              msg: "Please check your inbox and confirm your email address first." },
  { test: /user.*not.*found|no account/i,                           msg: "We couldn't find an account with that email." },
  { test: /email.*already.*registered|already.*use/i,               msg: "An account with this email already exists. Try logging in instead." },
  { test: /invalid.*token|expired.*token|token.*expired/i,          msg: "This link has expired. Please request a new one." },
  { test: /suspended|disabled|banned/i,                             msg: "This account has been suspended. Please contact support." },
  { test: /too many.*request|rate limit/i,                          msg: "Too many attempts. Please wait a minute and try again." },

  // Network
  { test: /network error|ECONNREFUSED|timeout/i, msg: "Can't reach the server right now. Check your connection and try again." },
];

/**
 * Returns a friendly message for the given error.
 * err can be an Axios error, a plain Error, or a string.
 */
export function friendlyError(err, fallback = 'Something went wrong. Please try again.') {
  const status  = err?.response?.status;
  const raw     = err?.response?.data?.error || err?.message || String(err || '');

  // 503 → always "setting up"
  if (status === 503) return "We're still setting things up — please try again in a moment.";
  // 429 → rate limit
  if (status === 429) return "Too many attempts. Please wait a minute and try again.";

  for (const { test, msg } of DEV_MAP) {
    if (test.test(raw)) return msg;
  }

  // Fall back to the raw error if it looks like a human-readable sentence (short, no stack)
  if (raw && raw.length < 120 && !raw.includes('\n') && !raw.includes('at ')) return raw;

  return fallback;
}
