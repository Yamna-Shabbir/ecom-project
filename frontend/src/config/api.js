const RENDER_API = "https://ecom-project-tjkq.onrender.com";

function resolveApiBase() {
  const fromEnv = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const { hostname, origin } = window.location;
    const onNetlify = hostname.includes("netlify.app") || hostname.endsWith(".netlify.com");
    if (onNetlify) return origin;
  }

  if (fromEnv && !fromEnv.includes("localhost")) return fromEnv;
  return fromEnv || "http://localhost:5000";
}

/** API base — on Netlify uses same origin (proxied to Render in netlify.toml). */
export const API_URL = resolveApiBase();

export function apiPath(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${normalized}`;
}

/** Product images are served from Render /uploads. */
export function resolveImageUrl(image) {
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  const p = image.startsWith("/") ? image : `/${image}`;
  const base = p.startsWith("/uploads") ? RENDER_API : API_URL;
  return `${base}${p}`;
}
