/**
 * Tiny dependency-free HTML sanitizer for admin-authored rich text.
 * Admin content is rendered on public pages via dangerouslySetInnerHTML, so it
 * MUST be sanitized: we keep a small allowlist of formatting tags/attributes
 * and drop everything else (scripts, iframes, event handlers, unsafe URLs).
 */
const ALLOWED_TAGS = new Set([
  "P", "BR", "DIV", "SPAN", "FONT",
  "STRONG", "B", "EM", "I", "U", "S", "STRIKE",
  "UL", "OL", "LI",
  "H2", "H3", "H4",
  "BLOCKQUOTE", "A",
]);

const ALLOWED_STYLE_PROPS = new Set([
  "font-family", "font-weight", "font-style", "text-decoration",
  "text-align", "color",
]);

function isSafeUrl(url) {
  const u = (url || "").trim().toLowerCase();
  return !(u.startsWith("javascript:") || u.startsWith("data:") || u.startsWith("vbscript:"));
}

function filterStyle(style) {
  return (style || "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((rule) => {
      const prop = rule.split(":")[0].trim().toLowerCase();
      return ALLOWED_STYLE_PROPS.has(prop) && !/expression|url\s*\(/i.test(rule);
    })
    .join("; ");
}

function cleanNode(node) {
  // Snapshot children — we mutate the tree as we go.
  Array.from(node.childNodes).forEach((child) => {
    if (child.nodeType === 3 /* text */) return;
    if (child.nodeType !== 1 /* element */) {
      child.remove();
      return;
    }
    const tag = child.tagName;
    if (!ALLOWED_TAGS.has(tag)) {
      // Disallowed element (script/img/iframe/style/…) — drop it entirely.
      child.remove();
      return;
    }
    // Strip every attribute except a small safe set.
    Array.from(child.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (name === "href" && tag === "A") {
        if (!isSafeUrl(attr.value)) child.removeAttribute("href");
      } else if (name === "style") {
        const filtered = filterStyle(attr.value);
        if (filtered) child.setAttribute("style", filtered);
        else child.removeAttribute("style");
      } else if (name === "face" && tag === "FONT") {
        /* keep font face */
      } else {
        child.removeAttribute(attr.name);
      }
    });
    if (tag === "A") {
      child.setAttribute("target", "_blank");
      child.setAttribute("rel", "noopener noreferrer nofollow");
    }
    cleanNode(child);
  });
}

/** Return a sanitized HTML string safe to inject into the DOM. */
export function sanitizeHtml(dirty) {
  if (!dirty || typeof dirty !== "string") return "";
  if (typeof window === "undefined" || !window.DOMParser) return "";
  const doc = new DOMParser().parseFromString(`<div>${dirty}</div>`, "text/html");
  const root = doc.body.firstChild;
  if (!root) return "";
  cleanNode(root);
  return root.innerHTML;
}

/** Strip all tags → plain text (for list/card previews and excerpts). */
export function htmlToText(html) {
  if (!html || typeof html !== "string") return "";
  if (typeof window === "undefined" || !window.DOMParser) return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
}

export default sanitizeHtml;
