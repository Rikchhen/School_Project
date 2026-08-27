// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { describe, expect, it, vi } from "vitest";
import { theme } from "../styles/theme";
import { HeroCarousel } from "./HeroCarousel";

vi.mock("../context/LanguageContext", () => ({
  useLang: () => ({
    lang: "en",
    t: (key) => key,
    pickLang: (record, field) => record?.[field] || record?.[`${field}Ne`] || "",
  }),
}));
vi.mock("../context/SettingsContext", () => ({ useSettings: () => ({ settings: { heroOpacity: 1 } }) }));
vi.mock("../lib/router", () => ({ Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a> }));

describe("HeroCarousel", () => {
  it("renders the admin-authored banner title, subtitle, and action", () => {
    render(
      <ThemeProvider theme={theme}>
        <HeroCarousel slides={[{
          imageUrl: "/uploads/hero.jpg",
          title: "Learning for life",
          subtitle: "A banner message written by the admin",
          ctaLabel: "Apply now",
          ctaLink: "/admissions",
        }]} />
      </ThemeProvider>,
    );

    expect(screen.getByRole("heading", { name: "Learning for life" })).toBeInTheDocument();
    expect(screen.getByText("A banner message written by the admin")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /apply now/i })).toHaveAttribute("href", "/admissions");
  });
});
