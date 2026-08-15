import { describe, it, expect } from "vitest";
import { sanitizeHtml, htmlToText } from "./sanitizeHtml";

describe("sanitizeHtml", () => {
  it("keeps allowed formatting tags", () => {
    const out = sanitizeHtml("<p>Hi <strong>bold</strong> <em>italic</em></p><ul><li>a</li></ul>");
    expect(out).toContain("<strong>");
    expect(out).toContain("<li>");
  });
  it("strips scripts and event handlers", () => {
    const out = sanitizeHtml('<p onclick="x()">ok</p><script>alert(1)</script>');
    expect(out).not.toContain("<script");
    expect(out.toLowerCase()).not.toContain("onclick");
  });
  it("hardens links and drops javascript: URLs", () => {
    const ok = sanitizeHtml('<a href="https://a.com">x</a>');
    expect(ok).toContain('rel="noopener noreferrer nofollow"');
    const bad = sanitizeHtml('<a href="javascript:alert(1)">x</a>');
    expect(bad).not.toContain("javascript:");
  });
});

describe("htmlToText", () => {
  it("strips tags to plain text", () => {
    expect(htmlToText("<p>Hello <strong>world</strong></p>")).toBe("Hello world");
  });
});
