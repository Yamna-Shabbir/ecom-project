const OpenAI = require("openai");

function normalizeProvider(v) {
  const s = String(v || "").trim().toLowerCase();
  if (!s) return "";
  if (s === "xai" || s === "grok") return "xai";
  if (s === "openai") return "openai";
  return s;
}

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const xai = process.env.XAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.XAI_API_KEY,
      baseURL: "https://api.x.ai/v1",
    })
  : null;

function getAiClient() {
  const provider = normalizeProvider(process.env.AI_PROVIDER) || (xai ? "xai" : "openai");
  const client = provider === "xai" ? xai : openai;
  const model =
    provider === "xai"
      ? process.env.XAI_MODEL || "grok-4-1-fast-non-reasoning"
      : process.env.OPENAI_MODEL || "gpt-4o-mini";
  return { client, model, provider };
}

module.exports = { getAiClient };
