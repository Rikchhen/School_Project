/**
 * Single fetch wrapper for the whole app.
 * - Always sends cookies (credentials: "include") for the JWT auth cookie.
 * - Parses JSON and throws a typed ApiError on non-2xx responses.
 */
const BASE_URL = import.meta.env.VITE_API_URL || "/api";
const FORM_STARTED_AT = Date.now();
let csrfToken = "";

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = "GET", body, headers, signal } = {}) {
  const isPublicForm = ["/submissions/contact", "/submissions/admission", "/submissions/donation"].includes(path);
  if (isPublicForm && body instanceof FormData) {
    if (!body.has("website")) body.append("website", "");
    if (!body.has("formStartedAt")) body.append("formStartedAt", String(FORM_STARTED_AT));
  } else if (isPublicForm && body && typeof body === "object") {
    body = { ...body, website: "", formStartedAt: FORM_STARTED_AT };
  }
  const opts = {
    method,
    credentials: "include",
    headers: { ...(headers || {}) },
    signal,
  };
  if (!["GET", "HEAD", "OPTIONS"].includes(method) && csrfToken) opts.headers["X-CSRF-Token"] = csrfToken;

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
  csrfToken = res.headers.get("x-csrf-token") || data?.csrfToken || csrfToken;

  if (!res.ok) {
    let message =
      (data && (data.message || data.error)) || `Request failed (${res.status})`;
    const detail = data?.details && Object.values(data.details).flat(Infinity).find((item) => typeof item === "string");
    if (message === "Validation failed" && detail) message = `${message}: ${detail}`;
    throw new ApiError(message, res.status, data?.details);
  }
  return data;
}

function upload(path, body, { onProgress, signal } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}${path}`);
    xhr.withCredentials = true;
    if (csrfToken) xhr.setRequestHeader("X-CSRF-Token", csrfToken);
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    });
    xhr.addEventListener("load", () => {
      const data = xhr.responseText ? safeParse(xhr.responseText) : null;
      csrfToken = xhr.getResponseHeader("x-csrf-token") || data?.csrfToken || csrfToken;
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(new ApiError(data?.message || data?.error || `Request failed (${xhr.status})`, xhr.status, data?.details));
    });
    xhr.addEventListener("error", () => reject(new ApiError("Network error — is the server running?", 0)));
    xhr.addEventListener("abort", () => reject(new DOMException("Upload cancelled", "AbortError")));
    signal?.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(body);
  });
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
  upload,
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
