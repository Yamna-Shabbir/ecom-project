# Render backend settings (fix "Missing script: start")

Use **either** option A (recommended) **or** B.

## Option A — Root Directory = `backend` (best)

| Setting | Value |
|---------|--------|
| **Root Directory** | `backend` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

## Option B — Repo root

| Setting | Value |
|---------|--------|
| **Root Directory** | *(leave empty)* |
| **Build Command** | `npm install --prefix backend` |
| **Start Command** | `npm start` |

Then push latest code to GitHub and **Manual Deploy** on Render.
