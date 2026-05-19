# AI Integration Guide (Gulkaar)

AI is **already built in** to this project. You only need API keys and env vars on **Render** (backend).

---

## What AI does in this app

| Feature | Where | What it does |
|---------|--------|----------------|
| **Shop chatbot** | Chat button on every page | Answers questions, finds products, order help |
| **AI SEO** | Admin → Manage Products | Generates on-page + off-page SEO for a product |

Both use the same AI setup (`backend/utils/aiClient.js`).

---

## Step 1 — Get an API key (pick one)

### Option A — OpenAI (recommended)

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create an API key (starts with `sk-...`)
3. New accounts often get free trial credits

### Option B — xAI (Grok)

1. Go to [https://console.x.ai](https://console.x.ai)
2. Create an API key

You only need **one** provider, not both.

---

## Step 2 — Add keys on Render (production)

Render → **ecom-project** (your API service) → **Environment**:

### Using OpenAI

| Key | Value |
|-----|--------|
| `AI_PROVIDER` | `openai` |
| `OPENAI_API_KEY` | `sk-your-key-here` |
| `OPENAI_MODEL` | `gpt-4o-mini` (optional, default) |

### Using xAI

| Key | Value |
|-----|--------|
| `AI_PROVIDER` | `xai` |
| `XAI_API_KEY` | `xai-your-key-here` |
| `XAI_MODEL` | `grok-4-1-fast-non-reasoning` (optional) |

**Save** → **Manual Deploy** (restart the API).

---

## Step 3 — Local development

Create `backend/.env` (never commit this file):

```env
OPENAI_API_KEY=sk-your-key-here
AI_PROVIDER=openai
OPENAI_MODEL=gpt-4o-mini
```

Or for xAI:

```env
XAI_API_KEY=xai-your-key-here
AI_PROVIDER=xai
```

Restart backend: `cd backend && npm run dev`

---

## How to use the chatbot

1. Open your site (Netlify or `http://localhost:3000`)
2. Click **Chat** (bottom-right)
3. Ask things like:
   - "Show me flower products"
   - "What's your return policy?"
   - "Products under $30"

The chatbot calls `POST /api/chatbot/query` on your Render API.

**Code:** `backend/routes/chatbotRoutes.js`, `frontend/src/components/ChatbotWidget.js`

---

## How to use AI SEO (admin)

1. Log in as **admin**
2. Go to **Manage Products**
3. Add or edit a product (at least **name**)
4. Click **Generate SEO through AI**
5. Review filled fields → **Save**

**Code:** `backend/services/productSeoAi.js`, `frontend/src/pages/ManageProducts.js`

More detail: [AI_SEO_GENERATION.md](./AI_SEO_GENERATION.md)

---

## Test that AI works

### Chatbot

Send a message in Chat. If AI is off, you'll see a message like "AI is not configured yet."

### SEO

Click **Generate SEO through AI**. If keys are missing, you'll get an alert about API keys.

### API test (optional)

```bash
curl -X POST https://ecom-project-tjkq.onrender.com/api/products/generate-seo \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Rose Bouquet\",\"price\":25,\"description\":\"Handmade crochet flowers\",\"category\":\"Flowers\",\"brand\":\"Gulkaar\"}"
```

---

## Architecture (simple)

```
Browser (Netlify)
    → POST /api/chatbot/query  ─┐
    → POST /api/products/generate-seo ─┤
                                         ▼
                              Render (Express)
                                         │
                              aiClient.js (OpenAI or xAI)
```

Keys stay **only on the server** (Render env). Never put API keys in Netlify or frontend env.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "AI is not configured" | Add `OPENAI_API_KEY` or `XAI_API_KEY` on Render, redeploy API |
| Chatbot works locally but not live | Keys only in local `.env` — add to Render too |
| SEO button does nothing / error | Same keys; check Render **Logs** for AI errors |
| Slow first reply | Normal on Render free tier (cold start) + AI latency |
| Billing | OpenAI/xAI charge per token — use `gpt-4o-mini` to keep cost low |

---

## Files reference

| File | Purpose |
|------|---------|
| `backend/utils/aiClient.js` | Picks OpenAI vs xAI from env |
| `backend/routes/chatbotRoutes.js` | Chatbot logic + product search |
| `backend/services/productSeoAi.js` | SEO JSON generation |
| `backend/routes/productRoutes.js` | `/generate-seo` routes |
| `frontend/src/components/ChatbotWidget.js` | Chat UI |
| `frontend/src/pages/ManageProducts.js` | SEO button |
