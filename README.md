# Adarsha Rastriya Secondary School — Website

A complete school website: a **bilingual (English / नेपाली) public site** plus a
**login-protected admin dashboard**, built to the Figma design as the source of
truth for layout, colour, typography, and spacing.

```
.
├── frontend/   # Vite + React (JavaScript/JSX), styled-components, socket.io-client
├── backend/    # Express 5 + TypeScript, Mongoose, socket.io, zod, JWT auth
└── README.md   # you are here
```

- **Design tokens** extracted from Figma live in one file:
  [`frontend/src/styles/theme.js`](frontend/src/styles/theme.js). Components never
  hardcode colours or sizes — they read from the theme.
- **Real-time:** when an admin publishes a notice or event, it is pushed live to
  every open public page over socket.io, with a toast confirmation.
- **Responsive:** desktop, tablet, and mobile.

---

## Tech stack

**Frontend** — `react`, `react-dom`, `vite`, `@vitejs/plugin-react`,
`styled-components` v6, `lucide-react`, `react-icons` v5, `socket.io-client` v4.
(No react-router — a tiny history-based router lives in
[`frontend/src/lib/router.jsx`](frontend/src/lib/router.jsx).)

**Backend** — `express` 5, `mongoose` 9, `socket.io` 4, `zod` 4,
`jsonwebtoken` 9, `bcryptjs` 3, `cookie-parser`, `cors`, `helmet` 8, `morgan`,
`multer` 2, `express-rate-limit` 8, `dotenv` 17. Dev: `typescript` 6,
`ts-node-dev`, `vitest` 4, `supertest` 7, `mongodb-memory-server` 11.

**Database** — MongoDB via Mongoose.

---

## Prerequisites

- **Node.js 18+** (20+ recommended)
- **MongoDB** running locally, _or_ a MongoDB Atlas connection string.
  (Local default: `mongodb://127.0.0.1:27017/adarsha_school`.)

---

## 1) Backend setup (`/backend`)

```bash
cd backend
npm install
cp .env.example .env        # then edit values as needed (Windows: copy .env.example .env)
```

### Environment variables (`backend/.env`)

| Variable            | Purpose                                             | Example                                   |
| ------------------- | --------------------------------------------------- | ----------------------------------------- |
| `PORT`              | API port                                            | `5000`                                    |
| `NODE_ENV`          | `development` \| `production` \| `test`             | `development`                             |
| `MONGO_URL`         | MongoDB connection string                           | `mongodb://127.0.0.1:27017/adarsha_school`|
| `JWT_SECRET_TOKEN`  | Secret used to sign auth JWTs (use a long random)   | `openssl rand -hex 32`                    |
| `JWT_EXPIRES_IN`    | Token lifetime                                      | `30m`                                     |
| `COOKIE_NAME`       | Name of the httpOnly auth cookie                    | `adarsha_token`                           |
| `CLIENT_URL`        | Frontend origin (CORS + socket.io)                  | `http://localhost:5173`                   |
| `SEED_ADMIN_EMAIL`    | Email for the seeded admin                         | `admin@adarsha.edu.np`                    |
| `SEED_ADMIN_PASSWORD` | Password for the seeded admin                      | `Admin@12345`                             |
| `SEED_ADMIN_NAME`     | Display name for the seeded admin                  | `School Administrator`                    |

### Seed demo content + the first admin

Admins **cannot self-register** — you seed the first one:

```bash
npm run seed
```

This creates the admin account (from the `SEED_ADMIN_*` env vars) and demo
notices, events, staff, gallery items, and editable pages.

Default demo login: **`admin@adarsha.edu.np` / `Admin@12345`**

### Run the API

```bash
npm run dev       # ts-node-dev with auto-restart → http://localhost:5000
```

Health check: `GET http://localhost:5000/api/health`

### Type-check & test

```bash
npm run typecheck      # tsc --noEmit  (must be clean)
npm test               # vitest + supertest against mongodb-memory-server
```

> Tests run against an in-memory MongoDB, so your real data is never touched.
> The first `npm test` run downloads the MongoDB binary once (can take a minute).

### Production build

```bash
npm run build      # → dist/
npm start          # node dist/index.js
```

---

## 2) Frontend setup (`/frontend`)

```bash
cd frontend
npm install
cp .env.example .env        # (Windows: copy .env.example .env)
```

### Environment variables (`frontend/.env`)

| Variable       | Purpose                       | Example                       |
| -------------- | ----------------------------- | ----------------------------- |
| `VITE_API_URL` | Base URL of the backend API   | `/api` (uses the dev proxy)   |

In development, leave `VITE_API_URL=/api`. The Vite dev server proxies `/api`,
`/uploads`, and `/socket.io` to the backend on port 5000 (see
`vite.config.js`), so cookies stay same-origin. For a deployed frontend talking
to a remote backend, set the full origin, e.g.
`VITE_API_URL=https://api.example.edu.np/api`.

### Run it

`npm run dev` builds the site and watches for changes; the **backend serves it
at http://localhost:5000** (open that URL — it's reliable in every browser):

```bash
npm run dev        # vite build --watch  → served by backend at :5000
```

Prefer hot-reload while developing? Use the Vite dev server instead
(`http://localhost:5180`), though it depends on dev-server websockets that some
browser/security setups block:

```bash
npm run dev:hmr    # → http://localhost:5180
```

### Production build

```bash
npm run build      # → dist/  (must build clean)
npm run preview    # serve the built site locally
```

---

## Easiest way to view the whole site (one URL)

The backend serves the **built** frontend from the same origin, so you can run
everything from a single URL with no Vite dev server, proxy, or CORS:

```bash
cd frontend && npm run build     # build the site into frontend/dist
cd ../backend && npm run dev     # serves the API AND the built site
```

Then open **http://localhost:5000/** in any browser. Rebuild the frontend
whenever you change it. (For live hot-reload while developing, use the Vite dev
server below instead.)

## Quick start (both together)

```bash
# terminal 1 — API
cd backend && npm install && cp .env.example .env && npm run seed && npm run dev

# terminal 2 — web
cd frontend && npm install && cp .env.example .env && npm run dev
```

Then open **http://localhost:5173** (public site) and
**http://localhost:5173/admin/login** (admin). Publish a notice in the admin and
watch it appear live on the public Notice Board / Home page.

---

## Features

### Public site
Home (hero + live notices/events), About, Academic/Programs, Admissions (enquiry
form), Faculty/Staff directory, Photo Gallery (with lightbox), Notice Board
(filter + search + live updates), News & Events, Contact (form). A working
**English ⇄ नेपाली** toggle switches all UI text.

Extras: an **animated hero banner carousel** (admin-managed), a **committee
members** page, a **donation page** the admin can show/hide, **social media
links** in the footer, a **rich-text editor** (bold/italic/fonts/lists/links)
for all body fields, **image cropping** on single uploads and **multi-image
upload** (bulk gallery, notice photos, banners), and a working **English ⇄
नेपाली** toggle that shows one language at a time with **localized (Nepali-
numeral) dates**.

### Admin dashboard (login required)
JWT-cookie login, an overview with live counts, and full CRUD for **notices
(with PDF + images), events, gallery images, staff, committee members, and
editable pages/text**, plus a **submissions inbox** and a **Settings** screen
(social links, donation page visibility, hero banners). Publishing a
notice/event broadcasts it live over socket.io.

---

## API overview

Base path: `/api`

| Method | Route                       | Auth  | Description                     |
| ------ | --------------------------- | ----- | ------------------------------- |
| GET    | `/health`                   | —     | Health check                    |
| POST   | `/auth/login`               | —     | Login (sets httpOnly cookie)    |
| POST   | `/auth/logout`              | —     | Logout                          |
| GET    | `/auth/me`                  | admin | Current admin                   |
| GET    | `/notices`                  | —     | List (filter/search/paginate)   |
| POST/PUT/DELETE | `/notices[/:id]`   | admin | Manage notices                  |
| GET    | `/events`                   | —     | List events                     |
| POST/PUT/DELETE | `/events[/:id]`    | admin | Manage events                   |
| GET    | `/gallery`                  | —     | List gallery items              |
| POST/PUT/DELETE | `/gallery[/:id]`   | admin | Manage gallery                  |
| GET    | `/staff`                    | —     | List staff                      |
| POST/PUT/DELETE | `/staff[/:id]`     | admin | Manage staff                    |
| GET    | `/pages` , `/pages/:slug`   | —     | Read editable pages             |
| PUT    | `/pages` , DELETE `/:slug`  | admin | Upsert / delete pages           |
| POST   | `/submissions/contact`      | —     | Contact form (rate limited)     |
| POST   | `/submissions/admission`    | —     | Admissions enquiry (rate limited)|
| GET/PATCH/DELETE | `/submissions[/:id]` | admin | Inbox management            |
| GET    | `/committee`                | —     | Management committee members    |
| POST/PUT/DELETE | `/committee[/:id]` | admin | Manage committee members       |
| GET    | `/settings`                 | —     | Socials, donation toggle, banners |
| PUT    | `/settings`                 | admin | Update site settings            |
| POST   | `/uploads-file`             | admin | Upload one image/PDF (croppable) |
| POST   | `/uploads-file/multiple`    | admin | Upload up to 12 images at once  |

All request bodies/queries are validated with **zod** before reaching a
controller. Passwords are hashed with **bcryptjs**; auth is a **JWT in an
httpOnly cookie**.

---

## Uploads & production note

### HTTPS is required in production

Deploy the app behind a TLS-terminating reverse proxy or hosting platform and
serve the public site only over HTTPS. When `NODE_ENV=production`, Helmet sends
an HSTS header (`max-age=31536000; includeSubDomains`). HSTS is intentionally
disabled during local HTTP development.

### Production security configuration

- Set unique secrets of at least 32 characters for `JWT_SECRET_TOKEN` and
  `DONOR_DOCUMENT_KEY`; production startup fails closed if either is unsafe.
- Set `TRUST_PROXY=1` only when Express is directly behind one trusted reverse
  proxy. This is required for accurate client IPs, secure cookies, and limits.
- Set `CLAMAV_ENABLED=true` and optionally `CLAMAV_COMMAND=clamdscan` when a
  ClamAV daemon/scanner is installed. Uploads fail closed if scanning fails.
- `DONOR_RETENTION_DAYS` defaults to 90. Expired donor files are erased while
  the non-sensitive inbox record remains for accountability.
- Keep MongoDB on a private interface, use a least-privilege database account,
  run Node as an unprivileged OS user, and firewall the API behind the proxy.
- Store secrets in the hosting provider's secret manager, never in the image or
  repository. Back up MongoDB with encryption and regularly test restoration.
- Terminate modern TLS at the reverse proxy/platform and redirect HTTP to HTTPS
  there. Monitor process health, authentication failures, and security audits.

Uploaded files (gallery photos, staff pics, notice PDFs) are stored in
`backend/uploads/` and served statically at `/uploads/...`.

> ⚠️ **Production:** most cloud hosts use ephemeral disks and **wipe local files
> on redeploy/restart**. For production, store uploads on object storage such as
> **Amazon S3** or **Cloudinary** instead of the local disk, and point the
> `imageUrl`/`photoUrl`/`attachmentUrl` fields at those URLs.

---

## Notes on the design

- The Figma provided 5 desktop frames (Home, About, Academic, Notice Board,
  News & Events). The remaining public pages (Admissions, Contact, Faculty,
  Gallery) and the entire admin dashboard were built in the **same visual
  language** using the tokens extracted into `theme.js`.
- Fonts (from Figma): **Plus Jakarta Sans** (headings), **Inter** (body/UI),
  **Noto Sans Devanagari** (Nepali) — loaded via Google Fonts in `index.html`.
- Every image uses an `onError` fallback to an inline placeholder
  (see `SmartImage`), so expired/broken URLs never show a broken-image icon.
- Accessibility: WCAG-AA-minded contrast, visible focus rings, and
  `prefers-reduced-motion` support in the global styles.
```
