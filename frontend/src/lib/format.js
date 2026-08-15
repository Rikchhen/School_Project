/**
 * Locale-aware formatting for the EN / NE toggle.
 *
 * Nepali dates are rendered in **Bikram Sambat (BS)** using the standard Nepali
 * calendar table (BS 2000–2100, anchored at BS 2000/01/01 = 1943-04-14 AD).
 * Dates outside that range fall back to the Gregorian date in Nepali numerals.
 */
const NEP_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

const EN_MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const EN_MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const NE_GREG_MONTHS = ["जनवरी", "फेब्रुअरी", "मार्च", "अप्रिल", "मे", "जुन", "जुलाई", "अगस्ट", "सेप्टेम्बर", "अक्टोबर", "नोभेम्बर", "डिसेम्बर"];

// Bikram Sambat month names (Baishakh … Chaitra).
const BS_MONTHS_NE = ["बैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज", "कात्तिक", "मंसिर", "पुस", "माघ", "फागुन", "चैत"];

// Days in each BS month, per BS year (index 0 = Baishakh).
// Verified data from medic/bikram-sambat. Epoch: BS 2076/01/01 = 2019-04-14 AD.
const BS_START_YEAR = 2076;
const BS_CALENDAR = {
  2076: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30], 2077: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2078: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30], 2079: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30], 2081: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2082: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], 2083: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2084: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30], 2085: [31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30],
  2086: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30], 2087: [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
  2088: [30, 31, 32, 32, 30, 31, 30, 30, 29, 30, 30, 30], 2089: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2090: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30], 2091: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2092: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], 2093: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2094: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30], 2095: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
};

// BS 2076/01/01 corresponds to 2019-04-14 AD (a well-established anchor).
const REFERENCE_AD_UTC = Date.UTC(2019, 3, 14);
const MS_PER_DAY = 86_400_000;

/** Convert a JS Date to Bikram Sambat { year, month, day } (month 1–12), or null if out of range. */
function adToBs(adDate) {
  const targetUtc = Date.UTC(adDate.getFullYear(), adDate.getMonth(), adDate.getDate());
  let days = Math.round((targetUtc - REFERENCE_AD_UTC) / MS_PER_DAY);
  if (days < 0) return null;
  let year = BS_START_YEAR;
  let month = 1;
  while (BS_CALENDAR[year]) {
    const dim = BS_CALENDAR[year][month - 1];
    if (days < dim) return { year, month, day: days + 1 };
    days -= dim;
    month += 1;
    if (month > 12) { month = 1; year += 1; }
  }
  return null; // out of table range
}

export function toNepaliNumerals(input) {
  return String(input).replace(/[0-9]/g, (d) => NEP_DIGITS[Number(d)]);
}

export function formatNumber(n, lang = "en") {
  return lang === "ne" ? toNepaliNumerals(n) : String(n);
}

/** Full date string. EN: "January 5, 2026". NE: Bikram Sambat, e.g. "२२ माघ २०८२". */
export function formatDate(date, lang = "en") {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  if (lang === "ne") {
    const bs = adToBs(d);
    if (bs) return `${toNepaliNumerals(bs.day)} ${BS_MONTHS_NE[bs.month - 1]} ${toNepaliNumerals(bs.year)}`;
    // Out of BS table range → Gregorian in Nepali numerals.
    return `${toNepaliNumerals(d.getDate())} ${NE_GREG_MONTHS[d.getMonth()]} ${toNepaliNumerals(d.getFullYear())}`;
  }
  return `${EN_MONTHS_LONG[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** Parts for a stacked date chip: { day, month, year } (localized; BS for Nepali). */
export function dateParts(date, lang = "en") {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return { day: "", month: "", year: "" };
  if (lang === "ne") {
    const bs = adToBs(d);
    if (bs) return { day: toNepaliNumerals(bs.day), month: BS_MONTHS_NE[bs.month - 1], year: toNepaliNumerals(bs.year) };
    return { day: toNepaliNumerals(d.getDate()), month: NE_GREG_MONTHS[d.getMonth()], year: toNepaliNumerals(d.getFullYear()) };
  }
  return { day: String(d.getDate()), month: EN_MONTHS_SHORT[d.getMonth()], year: String(d.getFullYear()) };
}

// Exposed for verification/testing.
export const __bs = { adToBs, BS_CALENDAR };
