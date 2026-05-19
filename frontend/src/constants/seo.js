/** Canonical site URL for meta tags, sitemap, and parasite SEO links. */
export const SITE_URL =
  (process.env.REACT_APP_SITE_URL || "https://gulkaar.netlify.app").replace(/\/$/, "");

export const SITE_NAME = "Gülkaar";
export const DEFAULT_DESCRIPTION =
  "Handmade crochet flowers, home décor & artisan gifts in Pakistan. Cash on delivery, crafted with love.";

export function buildCanonical(path = "/") {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

export function shopUrl(params = {}) {
  const q = new URLSearchParams(params).toString();
  return q ? `${SITE_URL}/register?${q}` : `${SITE_URL}/register`;
}

export function utmShopUrl({ source, medium, campaign, content }) {
  return shopUrl({
    utm_source: source,
    utm_medium: medium,
    utm_campaign: campaign || "parasite-seo",
    utm_content: content || "",
  });
}
