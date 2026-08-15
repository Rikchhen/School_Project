/**
 * Per-route document title, meta description, and Open Graph tags.
 * The app uses a custom router, so we update <head> imperatively on navigation.
 */
const SITE = "Adarsha Rastriya Secondary School";
const DEFAULT_DESC =
  "Adarsha Rastriya Secondary School, Lalgadh, Dhanusha — nurturing excellence, fostering tradition, and building the leaders of tomorrow.";

const ROUTES = {
  "/": { title: `${SITE} — Lalgadh, Dhanusha`, desc: DEFAULT_DESC },
  "/about": { title: `About Us · ${SITE}`, desc: "Our history, mission, vision, and facilities at Adarsha Rastriya Secondary School." },
  "/academic": { title: `Academic Programs · ${SITE}`, desc: "Explore our Science, Management, Humanities, and general secondary programs." },
  "/admissions": { title: `Admissions · ${SITE}`, desc: "Admissions are open — submit an enquiry and join our community of learners." },
  "/faculty": { title: `Faculty & Staff · ${SITE}`, desc: "Meet the dedicated educators and administrators of our school." },
  "/committee": { title: `Management Committee · ${SITE}`, desc: "The members guiding our school's vision and governance." },
  "/gallery": { title: `Photo Gallery · ${SITE}`, desc: "A glimpse into campus life at Adarsha Rastriya Secondary School." },
  "/notices": { title: `Notice Board · ${SITE}`, desc: "Latest announcements, academic schedules, and official notices." },
  "/events": { title: `News & Events · ${SITE}`, desc: "Upcoming events, achievements, and the latest school news." },
  "/contact": { title: `Contact Us · ${SITE}`, desc: "Reach out to Adarsha Rastriya Secondary School — address, phone, and email." },
  "/donation": { title: `Support Our School · ${SITE}`, desc: "Your contribution helps shape brighter futures for our students." },
};

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/** Update <head> for the given path. */
export function applyRouteMeta(path) {
  const meta =
    ROUTES[path] ||
    (path.startsWith("/admin")
      ? { title: `Admin · ${SITE}`, desc: DEFAULT_DESC }
      : { title: SITE, desc: DEFAULT_DESC });

  document.title = meta.title;
  upsertMeta("name", "description", meta.desc);
  upsertMeta("property", "og:site_name", SITE);
  upsertMeta("property", "og:title", meta.title);
  upsertMeta("property", "og:description", meta.desc);
  upsertMeta("property", "og:type", "website");
  upsertMeta("property", "og:url", window.location.href);
  upsertMeta("name", "twitter:card", "summary");
  upsertMeta("name", "twitter:title", meta.title);
  upsertMeta("name", "twitter:description", meta.desc);
}
