/** Production API on Render — set REACT_APP_API_URL in Netlify if the URL changes. */
const RENDER_API = "https://ecom-project-tjkq.onrender.com";

function resolveApiBase() {
  const fromEnv = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return fromEnv || "http://localhost:5000";
    }
  }

  return fromEnv || RENDER_API;
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

export const RENDER_API_URL = RENDER_API;
