# Deploy Gulkaar + Speed Test

This guide covers deploying the MERN app and running performance (Lighthouse) speed tests.

---

## Architecture (recommended)

| Service | Platform | Purpose |
|---------|----------|---------|
| **MongoDB** | [MongoDB Atlas](https://www.mongodb.com/atlas) | Database (free tier) |
| **Backend** | [Render](https://render.com) Web Service | `backend/` — API on port 10000 |
| **Frontend** | Render Static Site | `frontend/build` — React app |

---

## 1. MongoDB Atlas

1. Create a free cluster.
2. Database Access → add a user with password.
3. Network Access → allow `0.0.0.0/0` (or Render IPs).
4. Connect → copy connection string, e.g.  
   `mongodb+srv://USER:PASS@cluster.mongodb.net/gulkaar`

---

## 2. Deploy with Render (Blueprint)

1. Push this repo to **GitHub** (do not commit `.env` files).
2. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
3. Connect the repo — Render reads `render.yaml`.
4. Set **secret** environment variables when prompted:

   **Backend (`gulkaar-api`):**
   - `MONGO_URI` — Atlas connection string
   - `OPENAI_API_KEY` or `XAI_API_KEY` (for chatbot + SEO AI)
   - `STRIPE_SECRET_KEY`
   - `CLIENT_URL` — your frontend URL, e.g. `https://gulkaar-web.onrender.com`

   **Frontend (`gulkaar-web`):**
   - `REACT_APP_API_URL` — `https://gulkaar-api.onrender.com` (match your API service URL)
   - `REACT_APP_STRIPE_PUBLISHABLE_KEY`

5. Deploy both services. Wait until **gulkaar-api** health check passes:  
   `https://gulkaar-api.onrender.com/api/health`

6. Open the static site URL and log in with your admin credentials from `backend/config/admin.js`.

### Manual deploy (without Blueprint)

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
