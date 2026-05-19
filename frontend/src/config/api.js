/** Live API on Render — Netlify uses same-origin /api proxy (see netlify.toml). */
const RENDER_API = "https://ecom-project-tjkq.onrender.com";

function resolveApiBase() {
  const fromEnv = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return fromEnv || "http://localhost:5000";
    }
    // Netlify: call /api on same host → proxied to Render (no CORS, fewer cold-start issues)
    if (process.env.REACT_APP_USE_SAME_ORIGIN_API === "true") {
      return "";
    }
  }

  if (fromEnv && !fromEnv.includes("localhost")) return fromEnv;
  return "http://localhost:5000";
}

export const API_URL = resolveApiBase();

export function apiPath(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return API_URL ? `${API_URL}${normalized}` : normalized;
}

export function resolveImageUrl(image) {
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  const p = image.startsWith("/") ? image : `/${image}`;
  return API_URL ? `${API_URL}${p}` : p;
}

/** For direct Render URL (health pings outside Netlify proxy). */
export const RENDER_API_URL = RENDER_API;
