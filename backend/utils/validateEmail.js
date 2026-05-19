/** Practical email validation — real domains, no throwaway inboxes. */

const EMAIL_REGEX =
  /^[a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9])?@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

const BLOCKED_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "fake.com",
  "invalid.com",
  "localhost.com",
  "email.com",
  "mail.com",
]);

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "tempmail.com",
  "temp-mail.org",
  "10minutemail.com",
  "yopmail.com",
  "throwaway.email",
  "getnada.com",
  "sharklasers.com",
  "trashmail.com",
  "dispostable.com",
  "maildrop.cc",
  "fakeinbox.com",
]);

function normalizeEmail(raw) {
  return (raw || "").trim().toLowerCase();
}

function validateEmail(raw) {
  const email = normalizeEmail(raw);

  if (!email) {
    return { ok: false, message: "Email is required." };
  }

  if (email.length > 254) {
    return { ok: false, message: "Email is too long." };
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      ok: false,
      message: "Enter a valid email address (e.g. you@gmail.com).",
    };
  }

  const [local, domain] = email.split("@");

  if (local.length < 2) {
    return { ok: false, message: "Email address is too short." };
  }

  if (local.includes("..") || domain.includes("..")) {
    return { ok: false, message: "Email address is not valid." };
  }

  if (
    BLOCKED_DOMAINS.has(domain) ||
    DISPOSABLE_DOMAINS.has(domain) ||
    domain.endsWith(".test") ||
    domain.endsWith(".invalid") ||
    domain.endsWith(".localhost") ||
    domain.endsWith(".local")
  ) {
    return {
      ok: false,
      message: "Use a real email you can access (Gmail, Outlook, Yahoo, etc.).",
    };
  }

  const parts = domain.split(".");
  const tld = parts[parts.length - 1];
  if (!tld || tld.length < 2 || !/^[a-z]+$/.test(tld)) {
    return { ok: false, message: "Email domain looks invalid." };
  }

  if (parts.some((p) => p.length < 1)) {
    return { ok: false, message: "Email domain looks invalid." };
  }

  return { ok: true, email };
}

module.exports = { validateEmail, normalizeEmail };
