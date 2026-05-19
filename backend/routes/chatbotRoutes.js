const express = require("express");
const OpenAI = require("openai");
const Product = require("../models/Product");
const Order = require("../models/Order");
const SupportQuestion = require("../models/SupportQuestion");

function normalizeProvider(v) {
  const s = String(v || "").trim().toLowerCase();
  if (!s) return "";
  if (s === "xai" || s === "grok") return "xai";
  if (s === "openai") return "openai";
  return s;
}

const openaiKey = (process.env.OPENAI_API_KEY || "").trim();
const xaiKey = (process.env.XAI_API_KEY || "").trim();

const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

const xai = xaiKey
  ? new OpenAI({
      apiKey: xaiKey,
      baseURL: "https://api.x.ai/v1",
    })
  : null;

const router = express.Router();

const AI_SETUP_HINT =
  "AI is not configured. On Render → your API service → Environment, add OPENAI_API_KEY (and AI_PROVIDER=openai), then Manual Deploy.";

router.get("/status", (req, res) => {
  const provider = normalizeProvider(process.env.AI_PROVIDER) || (xai ? "xai" : openai ? "openai" : null);
  const configured = provider === "xai" ? Boolean(xai) : Boolean(openai);
  res.json({ configured, provider });
});

// --- Helper Functions ---

function escapeRegex(s) {
  return String(s).replace(/[.+?^${}()|[\]\\]/g, "\\$&");
}

function parsePriceBounds(text) {
  const n = String(text).toLowerCase();
  let minPrice = null;
  let maxPrice = null;
  const under =
    n.match(/\b(?:under|below|less than|up to|max(?:imum)?)\s*\$?\s*(\d+(?:\.\d+)?)/) ||
    n.match(/\$?\s*(\d+(?:\.\d+)?)\s*(?:or less|max)\b/);
  if (under) maxPrice = Number(under[1]);
  const above =
    n.match(/\b(?:above|over|more than|at least|min(?:imum)?)\s*\$?\s*(\d+(?:\.\d+)?)/) ||
    n.match(/\$?\s*(\d+(?:\.\d+)?)\s*(?:or more)\b/);
  if (above) minPrice = Number(above[1]);
  return { minPrice, maxPrice };
}

function extractKeyword(raw) {
  let s = String(raw).toLowerCase().trim();
  s = s.replace(
    /^(?:(?:can|could)\s+you\s+|please\s+)?(?:show\s+me|find(?:\s+me)?|search\s+for|list|what(?:'s|\s+is)?\s+)(?:some\s+|the\s+)?/i,
    " "
  );
  s = s.replace(/\b(?:the|some|all|any)\b/gi, " ");
  s = s.replace(/\bproducts?\b/gi, " ");
  s = s.replace(/\b(?:under|below|less than|up to|max(?:imum)?|above|over|more than|at least|min(?:imum)?)\s*\$?\s*\d+(?:\.\d+)?/gi, " ");
  s = s.replace(/\$\s*\d+(?:\.\d+)?/g, " ");
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

function hasProductSearchIntent(message) {
  const n = String(message).toLowerCase().trim();
  if (/^(?:(?:can|could)\s+you\s+|please\s+)?(show\s+me|find(?:\s+me)?|search\s+for|list\b)/i.test(n)) return true;
  if (/\b(?:can\s+you\s+|could\s+you\s+|please\s+)?(?:show|find|search|list)\s+(?:me\s+)?(?:some\s+)?[\w'-]+\s+products?\b/i.test(n))
    return true;
  if (/\bproducts?\s+(?:under|below|above|over|for\s+less)/i.test(n)) return true;
  if (/\b(under|below|less than|above|over|more than)\s*\$?\s*\d+/.test(n)) return true;
  return false;
}

function buildProductQuery(keyword, minPrice, maxPrice) {
  const andParts = [];
  const kw = keyword && keyword.length >= 2 ? keyword : "";
  if (kw) {
    const rx = new RegExp(escapeRegex(kw), "i");
    andParts.push({
      $or: [{ name: rx }, { description: rx }, { category: rx }],
    });
  }
  const priceCond = {};
  if (maxPrice != null) priceCond.$lte = maxPrice;
  if (minPrice != null) priceCond.$gte = minPrice;
  if (Object.keys(priceCond).length) andParts.push({ price: priceCond });
  if (!andParts.length) return null;
  return andParts.length === 1 ? andParts[0] : { $and: andParts };
}

function isAppSpecificQuestion(message) {
  const n = String(message).toLowerCase().trim();
  if (/\b(order|orders|purchase|purchased|buy|bought|tracking|track|delivery|shipped)\b/.test(n)) return true;
  if (hasProductSearchIntent(message)) return true;
  if (/\b(shipping|delivery|dispatch|return|refund|exchange|payment|pay|card|cash on delivery|cod)\b/.test(n)) return true;
  if (/\b(account|wishlist|favorite|saved|login|register|profile)\b/.test(n)) return true;
  if (/\b(cart|checkout|coupon|discount|promo)\b/.test(n)) return true;
  if (/\b(faq|question|help|support|contact)\b/.test(n)) return true;
  return false;
}

// --- Main Route ---

router.post("/query", async (req, res) => {
  try {
    const { message = "", email } = req.body;
    const normalized = String(message).toLowerCase();

    // === APP-SPECIFIC QUESTIONS (use database) ===
    if (isAppSpecificQuestion(message)) {
      
      // Order tracking
      if (normalized.includes("where is my order") || normalized.includes("track") || normalized.includes("my order")) {
        if (!email) return res.json({ reply: "Please sign in so I can check your orders.", products: [] });
        const order = await Order.findOne({ buyerEmail: email }).sort({ createdAt: -1 });
        if (!order) return res.json({ reply: "I couldn't find any orders for your account yet.", products: [] });
        return res.json({
          reply: `Your latest order #${order._id.toString().slice(-6)} is currently ${order.status || "Pending"}.`,
          products: [],
        });
      }

      // Shipping info
      if (normalized.includes("shipping")) {
        return res.json({
          reply: "Shipping: dispatch in 1-2 days, delivery usually 3-7 working days (depending on city). You'll see status updates in My Orders → Track Order.",
          products: [],
        });
      }

      // Return policy
      if (normalized.includes("return")) {
        return res.json({
          reply: "Return policy: accepted within 7 days for unused items with proof of purchase. If there's a defect/damage, contact us within 24 hours of delivery.",
          products: [],
        });
      }

      // Payment methods
      if (normalized.includes("payment")) {
        return res.json({
          reply: "Payments: Cash on Delivery or Card (Sandbox demo). For card, use test number 4242 4242 4242 4242.",
          products: [],
        });
      }

      // Product search
      if (hasProductSearchIntent(message)) {
        const { minPrice, maxPrice } = parsePriceBounds(message);
        const keyword = extractKeyword(message);
        const productQuery = buildProductQuery(keyword, minPrice, maxPrice);
        
        if (!productQuery) {
          return res.json({
            reply: 'Add a keyword (e.g. "handmade") or a price (e.g. "under 1000") so I can narrow results.',
            products: [],
          });
        }

        const products = await Product.find(productQuery).sort({ rating: -1, createdAt: -1 }).limit(12).lean();

        if (!products.length) {
          return res.json({
            reply: "No products found matching that. Try a different keyword or price range.",
            products: [],
          });
        }

        let reply = "Here's what I found:";
        if (keyword) reply += ` "${keyword}"`;
        if (maxPrice != null && minPrice != null) reply += ` between ${minPrice} and ${maxPrice}`;
        else if (maxPrice != null) reply += ` under ${maxPrice}`;
        else if (minPrice != null) reply += ` above ${minPrice}`;
        reply += ".";

        return res.json({ reply, products });
      }

      // Wishlist
      if (normalized.includes("wishlist")) {
        return res.json({
          reply: "Your wishlist shows items you've saved. Click the heart icon on any product to add it. Visit the Wishlist page to view all saved items.",
          products: [],
        });
      }

      // Cart
      if (normalized.includes("cart")) {
        return res.json({
          reply: "Your cart contains items you're ready to purchase. You can update quantities, apply coupons (SAVE10 or SAVE20), and proceed to checkout.",
          products: [],
        });
      }

      // Default app-specific response
      return res.json({
        reply: "I can help with orders, products, shipping, returns, payments, wishlist, and cart. What would you like to know?",
        products: [],
      });

    } else {
      
      // === GENERAL QUESTIONS (use GPT-4o-mini) ===
      try {
        const provider = normalizeProvider(process.env.AI_PROVIDER) || (xai ? "xai" : "openai");
        const client = provider === "xai" ? xai : openai;
        if (!client) {
          return res.json({
            reply: AI_SETUP_HINT,
            products: [],
            aiConfigured: false,
          });
        }

        const model =
          provider === "xai"
            ? process.env.XAI_MODEL || "grok-4-1-fast-non-reasoning"
            : process.env.OPENAI_MODEL || "gpt-4o-mini";

        const completion = await client.chat.completions.create({
          model,
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant for Gülkaar, a handmade crochet e-commerce store. Answer general knowledge questions clearly and concisely. Keep responses friendly and professional.",
            },
            {
              role: "user",
              content: message,
            },
          ],
          max_tokens: 300,
          temperature: 0.7,
        });

        const aiResponse = completion.choices[0].message.content;
        
        return res.json({
          reply: aiResponse,
          products: [],
          source: provider,
        });

      } catch (aiError) {
        console.error("AI API Error:", aiError.message);
        const invalidKey =
          aiError.status === 401 ||
          /invalid.*api.*key|incorrect api key|authentication/i.test(aiError.message || "");
        return res.json({
          reply: invalidKey
            ? "The AI API key is invalid or expired. Update OPENAI_API_KEY on Render and redeploy."
            : "I'm having trouble reaching the AI service right now. For orders, products, and shipping I can still help!",
          products: [],
          aiError: aiError.message,
        });
      }
    }

  } catch (err) {
    console.error("Chatbot error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;