# Deploy Gulkaar + Speed Test

**Recommended free path:** MongoDB Atlas + Render Blueprint (`render.yaml`).  
Total cost: **$0** on free tiers (backend may sleep when idle).

---

## Render asking for a credit card?

Render may ask for a card when you:

- Create a **Team** workspace (use **Personal / Hobby** instead)
- Add a **paid** plan by mistake
- Add **PostgreSQL** on Render (paid after trial — use **MongoDB Atlas** instead, not Render Postgres)
- Verify your account (some regions/accounts — card is not charged if you stay on free services)

**If you do add a card:** stay on **Free** web service + **Free** static site only. Set spending limits in Render → **Billing** if available. You should not be charged unless you upgrade or exceed free limits.

**If you do not want to add a card** — use the [No-card deploy path](#no-card-deploy-atlas--netlify--koyeb) below (Atlas + Netlify + Koyeb).

---

## No-card deploy (Atlas + Netlify + Koyeb)

Use this if Render requires payment details and you prefer not to add a card.

| Part | Service | Card needed? |
|------|---------|----------------|
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) M0 | No |
| React frontend | [Netlify](https://www.netlify.com) or [Vercel](https://vercel.com) | Usually no |
| Node API | [Koyeb](https://www.koyeb.com) free tier | Often no (check signup screen) |

### A. MongoDB Atlas

Same as [Step 2](#step-2--mongodb-atlas-free-database) below — Network Access `0.0.0.0/0`, copy `MONGO_URI`.

### B. Backend on Koyeb

1. [koyeb.com](https://www.koyeb.com) → sign up (GitHub).
2. **Create App** → **GitHub** → select your repo.
3. **Service** settings:
   - **Type:** Web service
   - **Builder:** Dockerfile *or* Buildpack — if no Dockerfile, use:
     - **Work directory:** `backend`
     - **Run command:** `npm start`
     - **Build command:** `npm install`
4. **Environment variables:**
   - `MONGO_URI` = your Atlas string
   - `CLIENT_URL` = your Netlify URL (set after step C, then redeploy)
   - `PORT` = `8000` (Koyeb sets `PORT` automatically — use their default)
   - `NODE_ENV` = `production`
   - API keys as needed
5. Deploy → copy your API URL, e.g. `https://your-app-xxx.koyeb.app`

### C. Frontend on Netlify

1. [netlify.com](https://www.netlify.com) → sign up (GitHub).
2. **Add new site** → **Import from Git** → your repo.
3. **Build settings:**
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/build`
4. **Environment variables:**
   - `REACT_APP_API_URL` = your Koyeb API URL (e.g. `https://your-app-xxx.koyeb.app`)
   - `REACT_APP_STRIPE_PUBLISHABLE_KEY` = `pk_test_...`
5. Deploy → copy site URL, e.g. `https://random-name.netlify.app`
6. Go back to Koyeb → set `CLIENT_URL` to that Netlify URL (no trailing slash) → **Redeploy** API.

### D. Verify

- `https://YOUR-KOYEB-URL/api/health` → `"mongo": "connected"`
- Open Netlify URL → shop loads, login works

---

## Quick start — Atlas + Render (step by step)

### What you will have when done

| Piece | URL (example) |
|-------|----------------|
| Database | MongoDB Atlas (cloud, no public URL) |
| API | `https://gulkaar-api.onrender.com` |
| Shop / admin UI | `https://gulkaar-web.onrender.com` |

---

### Step 1 — Push code to GitHub

1. Create a repo on GitHub (do **not** upload `.env` files).
2. From your project folder:

```bash
git init
git add .
git commit -m "Initial deploy"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

`.gitignore` already blocks `backend/.env`, `frontend/.env`, and other secrets.

---

### Step 2 — MongoDB Atlas (free database)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → sign up → **Create** → **M0 FREE** cluster.
2. **Database Access** → **Add New Database User** → username + password → save the password.
3. **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) so Render can connect.
4. **Database** → **Connect** → **Drivers** → copy the connection string.  
   It looks like:
   ```text
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your user password and add a database name before `?`:
   ```text
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/gulkaar?retryWrites=true&w=majority
   ```
   This full string is your **`MONGO_URI`**.

---

### Step 3 — Render Blueprint (API + frontend)

1. Go to [dashboard.render.com](https://dashboard.render.com) → sign up (GitHub login is easiest).
2. **New** → **Blueprint**.
3. Connect the GitHub repo that contains this project.
4. Render reads [`render.yaml`](../render.yaml) and creates two services:
   - **gulkaar-api** — Node backend
   - **gulkaar-web** — static React site

5. When asked for **secret** environment variables, paste values (see Step 4).  
   You can also add them later: each service → **Environment**.

6. Click **Apply** / deploy and wait until both services show **Live** (first deploy can take 5–10 minutes).

7. Note your real URLs from the Render dashboard (names may differ slightly):
   - API: `https://gulkaar-api.onrender.com`
   - Web: `https://gulkaar-web.onrender.com`

---

### Step 4 — Environment variables (Render dashboard only)

Never put these in git. Set them in Render → each service → **Environment**.

#### Backend service (`gulkaar-api`)

| Key | Value | Required |
|-----|--------|----------|
| `MONGO_URI` | Atlas string from Step 2 | Yes |
| `CLIENT_URL` | `https://gulkaar-web.onrender.com` | Yes — use **your** frontend URL, no trailing `/` |
| `NODE_ENV` | `production` | Set by blueprint |
| `PORT` | `10000` | Set by blueprint |
| `OPENAI_API_KEY` | Your OpenAI key | For chatbot + AI SEO |
| `XAI_API_KEY` | Your xAI key | Optional if using Grok |
| `AI_PROVIDER` | `openai` or `xai` | Optional |
| `STRIPE_SECRET_KEY` | `sk_test_...` | For card payments |

#### Frontend service (`gulkaar-web`)

| Key | Value | Required |
|-----|--------|----------|
| `REACT_APP_API_URL` | `https://gulkaar-api.onrender.com` | Yes — use **your** API URL |
| `REACT_APP_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | For Stripe checkout |

**Important:** `REACT_APP_*` is baked in at **build** time. After changing it, open **gulkaar-web** → **Manual Deploy** → **Clear build cache & deploy**.

**Important:** `CLIENT_URL` must match the frontend origin exactly (same `https://` host as **gulkaar-web**), or the browser will show CORS errors.

---

### Step 5 — Verify deployment

1. **API health** — open in browser:
   ```text
   https://gulkaar-api.onrender.com/api/health
   ```
   Expected:
   ```json
   { "ok": true, "env": "production", "mongo": "connected" }
   ```
   If `mongo` is not `"connected"`, check `MONGO_URI` and Atlas network access.

2. **Frontend** — open:
   ```text
   https://gulkaar-web.onrender.com
   ```
   Shop should load products (empty list is OK until you add products as admin).

3. **Admin login** — credentials are created on server start from `backend/config/admin.js` (email/password defined there).

4. **Cold start** — free Render API sleeps after ~15 minutes idle; first click may take 30–60 seconds.

---

### Step 6 — After deploy checklist

- [ ] `/api/health` shows `"mongo": "connected"`
- [ ] No CORS errors in browser DevTools → Console
- [ ] Login works on the live site
- [ ] `CLIENT_URL` = frontend URL, `REACT_APP_API_URL` = API URL
- [ ] Rebuild frontend if you changed `REACT_APP_*` vars

---

## Architecture

| Service | Platform | Purpose |
|---------|----------|---------|
| **MongoDB** | [MongoDB Atlas](https://www.mongodb.com/atlas) | Database (free M0 tier) |
| **Backend** | [Render](https://render.com) Web Service | `backend/` — API |
| **Frontend** | Render Static Site | `frontend/build` — React app |

---

## Manual deploy (without Blueprint)

**API (Web Service):**
- Root directory: `backend`
- Build: `npm install`
- Start: `npm start`
- Health check path: `/api/health`

**Frontend (Static Site):**
- Root directory: `frontend`
- Build: `npm install && npm run build`
- Publish directory: `build`
- Env: `REACT_APP_API_URL=https://YOUR-API.onrender.com`

---

## 3. Environment variables reference

### Backend (`backend/.env`)

```env
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://...
CLIENT_URL=https://gulkaar-web.onrender.com
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_...
```

Optional: `SERVE_CLIENT=true` to serve `frontend/build` from the same API host (single-service deploy).

### Frontend (`frontend/.env` — build time only)

```env
REACT_APP_API_URL=https://gulkaar-api.onrender.com
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_...
```

The app reads the API URL from `frontend/src/config/api.js` (`REACT_APP_API_URL`).

---

## 4. Speed test (Lighthouse)

Measures **Performance**, **Accessibility**, **Best practices**, **SEO**, plus API response times.

### Install (once, at repo root)

```bash
npm install
```

### Test local app

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm start`
3. From repo root:

```bash
npm run speed-test
```

Defaults: `SITE_URL=http://localhost:3000`, `API_URL=http://localhost:5000`

### Test production

```bash
# PowerShell
$env:SITE_URL="https://gulkaar-web.onrender.com"
$env:API_URL="https://gulkaar-api.onrender.com"
npm run speed-test

# macOS / Linux
SITE_URL=https://gulkaar-web.onrender.com API_URL=https://gulkaar-api.onrender.com npm run speed-test
```

### Output

- Console: scores and Core Web Vitals (FCP, LCP, TBT, CLS)
- HTML report: `reports/lighthouse-report.html`

### CI (GitHub Actions)

Workflow: `.github/workflows/speed-test.yml`

- Runs on push/PR to `main` / `master`
- Manual run: **Actions** → **Speed test** → **Run workflow** (set your live URLs)

Download the **lighthouse-report** artifact after the job finishes.

### Fail build on low performance (optional)

```bash
MIN_PERF_SCORE=0.7 npm run speed-test
```

Exits with code 1 if Performance score is below 70%.

---

## 5. Post-deploy checklist

- [ ] `GET /api/health` returns `{ "ok": true, "mongo": "connected" }`
- [ ] Frontend loads products from API (no CORS errors in browser console)
- [ ] `CLIENT_URL` matches exact frontend origin (including `https`)
- [ ] Image uploads work (Render disk is ephemeral — consider Cloudinary/S3 for production)
- [ ] Run `npm run speed-test` against live URLs

---

## 6. Other hosts

| Frontend | Backend |
|----------|---------|
| Vercel / Netlify | Render / Railway / Fly.io |
| Set `REACT_APP_API_URL` at build time | Set `CLIENT_URL` to frontend URL |

Same env vars; only dashboard names change.

---

## Troubleshooting

**CORS errors**  
`CLIENT_URL` must exactly match the browser origin (e.g. `https://gulkaar-web.onrender.com`, no trailing slash).

**API works locally, not in production**  
Rebuild frontend after changing `REACT_APP_API_URL` (CRA bakes env at build time).

**Lighthouse fails locally**  
Ensure Chrome/Chromium is available; on Linux CI it runs headless automatically.

**Render cold start**  
Free tier sleeps after inactivity; first request may be slow — speed test may need a retry.
