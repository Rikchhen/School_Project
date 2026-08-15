import { describe, it, expect } from "vitest";
import { formatDate, formatNumber, toNepaliNumerals, dateParts, __bs } from "./format";

describe("Nepali numerals", () => {
  it("converts digits", () => {
    expect(toNepaliNumerals(2083)).toBe("२०८३");
    expect(formatNumber(1200, "ne")).toBe("१२००");
    expect(formatNumber(1200, "en")).toBe("1200");
  });
});

describe("Bikram Sambat conversion", () => {
  const anchors = [
    ["2019-04-14", 2076], ["2020-04-13", 2077], ["2021-04-14", 2078],
    ["2023-04-14", 2080], ["2024-04-13", 2081], ["2025-04-14", 2082], ["2026-04-14", 2083],
  ];
  it("maps every Nepali New Year to BS Y/1/1", () => {
    for (const [ad, y] of anchors) {
      const [Y, M, D] = ad.split("-").map(Number);
      const bs = __bs.adToBs(new Date(Y, M - 1, D));
      expect(bs).toEqual({ year: y, month: 1, day: 1 });
    }
  });
});

describe("formatDate", () => {
  it("English shows the AD date", () => {
    expect(formatDate("2026-01-05", "en")).toBe("January 5, 2026");
  });
  it("Nepali shows a Bikram Sambat date with Devanagari numerals", () => {
    const s = formatDate("2026-04-14", "ne");
    expect(s).toContain("२०८३"); // BS year
    expect(s).toContain("बैशाख"); // Baishakh
  });
  it("dateParts returns localized pieces", () => {
    const en = dateParts("2026-08-12", "en");
    expect(en.month).toBe("Aug");
    const ne = dateParts("2026-08-12", "ne");
    expect(ne.year).toBe("२०८३");
  });
});
