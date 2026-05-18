/** Backend base URL — set REACT_APP_API_URL in production (e.g. Render). */
export const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/$/, "");

export function apiPath(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${normalized}`;
}

/** Turn upload path or relative image URL into a full URL. */
export function resolveImageUrl(image) {
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  const p = image.startsWith("/") ? image : `/${image}`;
  return `${API_URL}${p}`;
}
