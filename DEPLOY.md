# Deploying the Adarsha School Website (going live)

This guide takes your site from your computer to a **real, always-on website** where
content and uploaded files **persist permanently**. Recommended stack (mostly free):

- **Database:** MongoDB Atlas (free) — holds all your text/content.
- **Hosting:** Render — runs the app; the backend also serves the frontend, so it's
  **one service, one URL**.
- **Uploaded files:** a Render **persistent disk** (a few $/month) so images/videos/PDFs
  survive restarts. (Free alternative: Cloudinary — see the appendix.)

> ⚠️ **Never run `npm run seed` on the live site.** It deletes ALL data and re-inserts
> sample content. It is a local development helper only.

---

## Step 1 — Put your code on GitHub
1. Create a new **private** repository on GitHub.
2. Push this project to it (root of the repo must contain `frontend/`, `backend/`,
   `render.yaml`, and this `DEPLOY.md`).

## Step 2 — Create the database (MongoDB Atlas)
1. Sign up at <https://www.mongodb.com/atlas> and create a **free M0 cluster**
   (choose a region near Nepal, e.g. Mumbai/Singapore).
2. **Database Access →** create a database user (username + password). Save them.
3. **Network Access →** add IP `0.0.0.0/0` (allow from anywhere — Render needs this).
4. **Connect → Drivers →** copy the connection string. It looks like:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/adarsha_school?retryWrites=true&w=majority`
   Replace `USER`/`PASSWORD` with the user you made, and keep `/adarsha_school` as the
   database name. This is your **`MONGO_URL`**.
5. **Backups:** Atlas keeps automated backups on paid tiers; on free M0, periodically
   export via "Database → ... → Export" or upgrade later.

## Step 3 — Deploy on Render (uses `render.yaml`)
1. Sign up at <https://render.com> and connect your GitHub account.
2. **New + → Blueprint →** select this repository. Render reads `render.yaml` and
   creates the web service **with a persistent disk** automatically.
3. When prompted, fill in the env vars marked "fill in" (see Step 4). `JWT_SECRET_TOKEN`
   and `DONOR_DOCUMENT_KEY` are **generated for you** by Render.
4. Click **Apply / Create**. First build takes a few minutes.
5. When it's live, Render gives you a URL like `https://adarsha-school.onrender.com`.

## Step 4 — Environment variables (set in Render dashboard)
`render.yaml` sets most of these. You must provide:

| Variable | Value |
|---|---|
| `MONGO_URL` | Your Atlas connection string from Step 2 |
| `CLIENT_URL` | Your live URL, e.g. `https://adarsha-school.onrender.com` (update to your domain later) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Only if you plan to seed the first admin once (Step 6) |

Already handled by `render.yaml` (no action needed): `NODE_ENV=production`,
`UPLOAD_ROOT=/var/data`, `TRUST_PROXY=1`, `DISABLE_ADMIN_AUTH=false`,
`JWT_SECRET_TOKEN` (auto), `DONOR_DOCUMENT_KEY` (auto).

> After the first deploy, set `CLIENT_URL` to the exact live URL and **redeploy** —
> this is required for secure login cookies and CORS to work.

## Step 5 — Create your admin login
Your app validates a secure `JWT_SECRET_TOKEN` and `DONOR_DOCUMENT_KEY` in production
(Render generates both). To create the first administrator, either:
- **Recommended:** open a Render **Shell** for the service and run, from the repo:
  ```bash
  cd backend && npm run seed
  ```
  This creates the admin (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`) **and loads sample
  content**. Do this **once**, before you add real content. Or:
- Ask your developer to add an admin directly, so no sample data is inserted.

Then log in at `https://YOUR-URL/admin` and **change the admin password** immediately.

## Step 6 — Add your real content
Log into `/admin` and replace the sample notices/events/programs/etc. with your real
content, upload your logo, hero banners (images **and** videos), syllabus PDFs, etc.
Everything now saves to Atlas (text) and the Render disk (files) — **permanently**.

## Step 7 — Custom domain (optional)
1. Buy a domain (e.g. Namecheap, GoDaddy).
2. Render → your service → **Settings → Custom Domains →** add your domain and follow
   the DNS instructions.
3. Update `CLIENT_URL` to `https://yourdomain.com` and redeploy.

---

## Why content used to "disappear" locally
On your computer, data lived in a local MongoDB and files in a local folder — if Mongo
wasn't running, you ran `npm run seed`, or you moved the project, that content was gone.
After this deployment, content lives in **Atlas** (cloud DB) and files on a **persistent
disk**, so nothing is erased on restart. Just remember: **don't run the seed again.**

---

## Appendix A — Free file storage with Cloudinary (instead of the paid disk)
The Render disk is the simplest option (no code change). If you'd rather use the free
Cloudinary tier for images/videos:
- It requires code changes to the upload handling (store to Cloudinary, save the
  returned URL instead of a local path) plus a Cloudinary account + API keys.
- Ask your developer (or me) to wire it up; then you can drop the persistent disk.

## Appendix B — Environment variable reference
See `backend/.env.example` for every variable, its purpose, and safe defaults. In
production the app **requires** a unique `JWT_SECRET_TOKEN` (≥32 chars) and
`DONOR_DOCUMENT_KEY` (≥32 chars) — Render generates these automatically via `render.yaml`.

## Appendix C — Running locally (for development)
- Install and run MongoDB locally (or point `MONGO_URL` at your Atlas cluster).
- `backend/`:  `npm install && npm run dev`
- `frontend/`: `npm install && npm run dev` (or `npm run dev:hmr` for hot reload)
- Seed sample data (wipes the dev DB): `cd backend && npm run seed`
