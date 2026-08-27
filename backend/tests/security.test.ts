import { describe, expect, it } from "vitest";
import { shouldSkipCsrf } from "../src/middleware/security";

describe("CSRF development bypass", () => {
  it("skips CSRF for mutations only when development auth is disabled", () => {
    expect(shouldSkipCsrf("POST", "/api/uploads-file", false, true)).toBe(true);
    expect(shouldSkipCsrf("POST", "/api/uploads-file", false, false)).toBe(false);
  });
});
