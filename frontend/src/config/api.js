/** Live API on Render — override with REACT_APP_API_URL in Netlify env. */
const RENDER_API = "https://ecom-project-tjkq.onrender.com";

function resolveApiBase() {
  const fromEnv = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");
  if (fromEnv && !fromEnv.includes("localhost")) return fromEnv;
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return RENDER_API;
  }
  return "http://localhost:5000";
}

export const API_URL = resolveApiBase();

export function apiPath(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${normalized}`;
}

export function resolveImageUrl(image) {
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  const p = image.startsWith("/") ? image : `/${image}`;
  return `${API_URL}${p}`;
}
