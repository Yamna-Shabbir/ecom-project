const { getAiClient } = require("../utils/aiClient");

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseJsonFromContent(content) {
  const raw = String(content || "").trim();
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const text = fenced ? fenced[1].trim() : raw;
  return JSON.parse(text);
}

async function generateProductSeo(product) {
  const { client, model } = getAiClient();
  if (!client) {
    const err = new Error("AI is not configured. Add OPENAI_API_KEY or XAI_API_KEY to backend/.env and restart.");
    err.statusCode = 503;
    throw err;
  }

  const context = {
    name: product.name,
    price: product.price,
    description: product.description || "",
    category: product.category || "General",
    brand: product.brand || "Gulkaar",
    rating: product.rating ?? 4.5,
  };

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.5,
    max_tokens: 900,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an expert e-commerce SEO specialist for Gulkaar, a handmade crochet and accessories store.
Return ONLY valid JSON with this exact shape:
{
  "onPage": {
    "seoTitle": "string (max 60 chars, include brand Gulkaar)",
    "seoDescription": "string (max 160 chars, compelling)",
    "seoKeywords": ["array", "of", "5-10", "keywords"],
    "metaRobots": "index,follow",
    "slug": "url-friendly-slug",
    "imageAlt": "descriptive alt text for product image"
  },
  "offPage": {
    "ogTitle": "string for Open Graph (max 70 chars)",
    "ogDescription": "string for social sharing (max 200 chars)",
    "socialShareText": "short post for Instagram/Facebook (max 280 chars)",
    "pinterestDescription": "Pinterest pin description with hashtags (max 500 chars)",
    "backlinkKeywords": ["array", "of", "3-6", "anchor-text", "ideas"]
  }
}
On-page SEO = meta title, description, keywords, robots, slug, image alt.
Off-page SEO = Open Graph, social captions, Pinterest, backlink anchor ideas.
Use the product facts provided. Be specific to the product, not generic.`,
      },
      {
        role: "user",
        content: JSON.stringify(context),
      },
    ],
  });

  const parsed = parseJsonFromContent(completion.choices[0]?.message?.content);
  const onPage = parsed.onPage || {};
  const offPage = parsed.offPage || {};

  return {
    seoTitle: String(onPage.seoTitle || "").slice(0, 70),
    seoDescription: String(onPage.seoDescription || "").slice(0, 170),
    seoKeywords: Array.isArray(onPage.seoKeywords)
      ? onPage.seoKeywords.map((k) => String(k).trim()).filter(Boolean).slice(0, 12)
      : [],
    metaRobots: onPage.metaRobots || "index,follow",
    slug: slugify(onPage.slug || context.name),
    imageAlt: String(onPage.imageAlt || context.name).slice(0, 200),
    ogTitle: String(offPage.ogTitle || onPage.seoTitle || "").slice(0, 80),
    ogDescription: String(offPage.ogDescription || onPage.seoDescription || "").slice(0, 220),
    socialShareText: String(offPage.socialShareText || "").slice(0, 320),
    pinterestDescription: String(offPage.pinterestDescription || "").slice(0, 520),
    backlinkKeywords: Array.isArray(offPage.backlinkKeywords)
      ? offPage.backlinkKeywords.map((k) => String(k).trim()).filter(Boolean).slice(0, 8)
      : [],
  };
}

module.exports = { generateProductSeo };
