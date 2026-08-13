/**
 * Single fetch wrapper for the whole app.
 * - Always sends cookies (credentials: "include") for the JWT auth cookie.
 * - Parses JSON and throws a typed ApiError on non-2xx responses.
 */
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = "GET", body, headers, signal } = {}) {
  const opts = {
    method,
    credentials: "include",
    headers: { ...(headers || {}) },
    signal,
  };

  if (body instanceof FormData) {
    opts.body = body; // let the browser set the multipart boundary
  } else if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, opts);
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    throw new ApiError("Network error — is the server running?", 0);
  }

  // 204 / empty body
  const text = await res.text();
  const data = text ? safeParse(text) : null;

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data?.details);
  }
  return data;
}

function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function qs(params = {}) {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (!entries.length) return "";
  return "?" + new URLSearchParams(entries).toString();
}

export const api = {
  raw: request,
  get: (path, params, opts) => request(`${path}${qs(params)}`, opts),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
  patch: (path, body, opts) => request(path, { ...opts, method: "PATCH", body }),
  del: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};

/** Build an absolute URL for a stored upload path ("/uploads/xyz.jpg"). */
export function assetUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//.test(url)) return url;
  // In dev, /uploads is proxied to the backend; in prod set VITE_API_URL host.
  return url;
}

export default api;
