import { describe, it, expect } from "vitest";
import { validateFields, required, minLen, email } from "./validate";

const RULES = {
  name: [required("Name"), minLen(2, "Name")],
  email: [required("Email"), email()],
};

describe("validateFields", () => {
  it("flags empty required fields", () => {
    const errs = validateFields({ name: "", email: "" }, RULES);
    expect(errs.name).toMatch(/required/);
    expect(errs.email).toMatch(/required/);
  });
  it("flags an invalid email", () => {
    const errs = validateFields({ name: "Ram", email: "not-an-email" }, RULES);
    expect(errs.name).toBeUndefined();
    expect(errs.email).toMatch(/valid email/);
  });
  it("passes valid input", () => {
    const errs = validateFields({ name: "Ram Bahadur", email: "ram@example.com" }, RULES);
    expect(Object.keys(errs)).toHaveLength(0);
  });
});
