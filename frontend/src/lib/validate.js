/** Lightweight client-side field validation for the public forms. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateFields(values, rules) {
  const errors = {};
  for (const [field, checks] of Object.entries(rules)) {
    const v = (values[field] ?? "").toString().trim();
    for (const check of checks) {
      const msg = check(v);
      if (msg) { errors[field] = msg; break; }
    }
  }
  return errors;
}

export const required = (label) => (v) => (v ? "" : `${label} is required`);
export const minLen = (n, label) => (v) => (!v || v.length >= n ? "" : `${label} must be at least ${n} characters`);
export const email = () => (v) => (!v || EMAIL_RE.test(v) ? "" : "Enter a valid email address");
