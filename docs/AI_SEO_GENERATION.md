# How AI SEO Generation Was Built

This document explains how the **Generate SEO through AI** feature works in the Gulkaar admin product form.

---

## What it does

When an admin clicks **Generate SEO through AI** on the Manage Products page:

1. The app sends the **current product details** (name, price, description, category, brand, rating) to the backend.
2. The backend calls an AI model (OpenAI or xAI — same setup as the chatbot).
3. The AI returns structured JSON for **on-page** and **off-page** SEO.
4. The form fields are filled automatically. The admin can edit them and save the product.

---

## Files involved

| File | Role |
|------|------|
| `frontend/src/pages/ManageProducts.js` | Button, form fields, calls API, fills form |
| `backend/routes/productRoutes.js` | API routes for SEO generation |
| `backend/services/productSeoAi.js` | Builds AI prompt and parses JSON response |
| `backend/utils/aiClient.js` | Shared OpenAI/xAI client (reads `.env`) |
| `backend/models/Product.js` | Stores all SEO fields in MongoDB |
| `frontend/src/components/SeoHead.js` | Uses on-page + OG meta on product pages |
| `frontend/src/pages/ProductDetails.js` | Passes product SEO to `SeoHead` and image alt |

---

## SEO fields (on-page vs off-page)

### On-page SEO (on your website)

| Field | Purpose |
|-------|---------|
| `seoTitle` | Browser tab / Google title |
| `seoDescription` | Meta description in search results |
| `seoKeywords` | Meta keywords (array) |
| `metaRobots` | e.g. `index,follow` |
| `slug` | URL-friendly path |
| `imageAlt` | Accessible alt text for product image |

### Off-page SEO (sharing & external)

| Field | Purpose |
|-------|---------|
| `ogTitle` | Open Graph title (Facebook, LinkedIn, etc.) |
| `ogDescription` | Open Graph description |
| `socialShareText` | Short post for Instagram/Facebook |
| `pinterestDescription` | Pinterest pin copy + hashtags |
| `backlinkKeywords` | Suggested anchor phrases for outreach |

---

## API endpoints

### 1. New product (not saved yet)

```
POST http://localhost:5000/api/products/generate-seo
Content-Type: application/json

{
  "name": "Chunky Knit Tote",
  "price": 45,
  "description": "Handmade crochet tote bag",
  "category": "Scarfs",
  "brand": "Gulkaar",
  "rating": 4.5
}
```

**Response:** JSON with all SEO fields (see `productSeoAi.js` return shape).

### 2. Existing product (by MongoDB id)

```
POST http://localhost:5000/api/products/:id/generate-seo
Content-Type: application/json

{
  "name": "...",
  "price": 45,
  ...
}
```

Body is optional; missing fields fall back to the saved product in the database.

---

## Route order (important)

In `productRoutes.js`, these routes are registered **before** `POST /:id/event`:

```text
POST /generate-seo
POST /:id/generate-seo
POST /:id/event
```

If `/generate-seo` were placed after `/:id/event`, Express would treat `generate-seo` as a product id and the wrong handler would run.

---

## AI service flow (`productSeoAi.js`)

1. **`getAiClient()`** (`utils/aiClient.js`) picks provider from `.env`:
   - `AI_PROVIDER=xai` → xAI (Grok)
   - Otherwise → OpenAI if `OPENAI_API_KEY` is set

2. **System prompt** tells the model to return **only JSON** with `onPage` and `offPage` objects.

3. **`response_format: { type: "json_object" }`** forces valid JSON from OpenAI-compatible APIs.

4. Response is parsed, trimmed to safe lengths, and `slug` is normalized (lowercase, hyphens).

Example shape the AI returns:

```json
{
  "onPage": {
    "seoTitle": "Chunky Knit Tote | Gulkaar",
    "seoDescription": "...",
    "seoKeywords": ["crochet", "handmade tote"],
    "metaRobots": "index,follow",
    "slug": "chunky-knit-tote",
    "imageAlt": "Handmade chunky knit crochet tote in cream yarn"
  },
  "offPage": {
    "ogTitle": "...",
    "ogDescription": "...",
    "socialShareText": "...",
    "pinterestDescription": "...",
    "backlinkKeywords": ["handmade crochet bag", "..."]
  }
}
```

---

## Frontend flow (`ManageProducts.js`)

### State

Extra form fields: `imageAlt`, `ogTitle`, `ogDescription`, `socialShareText`, `pinterestDescription`, `backlinkKeywords`, plus `generatingSeo` for loading.

### `handleGenerateSeo`

```javascript
const url = editId
  ? `http://localhost:5000/api/products/${editId}/generate-seo`
  : "http://localhost:5000/api/products/generate-seo";

const res = await axios.post(url, {
  name: form.name,
  price: form.price,
  description: form.description,
  category: form.category,
  brand: form.brand,
  rating: form.rating,
});

applySeoToForm(res.data); // fills all SEO inputs
```

### Saving

On submit, `seoKeywords` and `backlinkKeywords` are split from comma-separated strings into arrays before `POST` or `PUT` to `/api/products`.

---

## Environment variables

Same as the chatbot (in `backend/.env`):

```env
# Use one or both:
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

AI_PROVIDER=xai
XAI_API_KEY=xai-...
XAI_MODEL=grok-4-1-fast-non-reasoning
```

If no API key is configured, the API returns **503** with a message to add keys and restart the server.

---

## How it appears on the storefront

- **Product page** (`ProductDetails.js`) uses `SeoHead` with `seoTitle`, `seoDescription`, `seoKeywords`, `metaRobots`, plus `ogTitle`, `ogDescription`, `ogImage`.
- Product **image** uses `imageAlt` when set.

Off-page copy (Pinterest, social text, backlink keywords) is mainly for **admin use** when marketing; it is stored on the product and shown in the admin form.

---

## How to test manually

1. Start MongoDB and the backend: `cd backend && npm run dev`
2. Start the frontend: `cd frontend && npm start`
3. Log in as admin → **Manage Products**
4. Enter a product name and details → click **Generate SEO through AI**
5. Confirm fields populate → **Add Product** or **Update Product**
6. Open the product on the shop and view page source for meta/OG tags

### Test API with curl

```bash
curl -X POST http://localhost:5000/api/products/generate-seo ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Rose Crochet Bouquet\",\"price\":30,\"description\":\"Handmade flower bouquet\",\"category\":\"Flowers\",\"brand\":\"Gulkaar\",\"rating\":4.8}"
```

(PowerShell: use backticks for line continuation instead of `^` if needed.)

---

## Summary

| Step | What happens |
|------|----------------|
| 1 | Admin fills product basics and clicks the button |
| 2 | Frontend POSTs to `/generate-seo` or `/:id/generate-seo` |
| 3 | Backend calls AI with product context + JSON schema |
| 4 | SEO fields returned and mapped into the form |
| 5 | Admin saves product → MongoDB stores all fields |
| 6 | Product page uses on-page + OG meta for SEO and sharing |

No separate “SEO service” account is required beyond the same AI keys already used for the chatbot.
