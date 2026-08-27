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
  it("decodes and sanitizes legacy escaped rich text", () => {
    const out = sanitizeHtml("&lt;b&gt;Bold&lt;/b&gt;&lt;div&gt;&lt;br&gt;&lt;/div&gt;");
    expect(out).toContain("<b>Bold</b>");
    expect(out).toContain("<br>");
    expect(out).not.toContain("&lt;b&gt;");
  });
  it("allows plain font sizes and rejects unsafe or arbitrary values", () => {
    const out = sanitizeHtml('<span style="font-size: 24px; color: #b90035">Safe</span><span style="font-size: calc(1px + 2vw)">Bad</span><span style="font-size: url(x)">Bad</span>');
    expect(out).toContain("font-size: 24px");
    expect(out).toContain("color: #b90035");
    expect(out).not.toContain("calc(");
    expect(out).not.toContain("url(");
  });
});

describe("htmlToText", () => {
  it("strips tags to plain text", () => {
    expect(htmlToText("<p>Hello <strong>world</strong></p>")).toBe("Hello world");
  });
});
