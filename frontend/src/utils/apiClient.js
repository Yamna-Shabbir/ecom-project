import axios from "axios";
import { apiPath } from "../config/api";

export const api = axios.create({ timeout: 90000 });

export async function apiPost(path, data) {
  return api.post(apiPath(path), data);
}

/** Wake Render free tier; only succeeds when health JSON returns ok: true. */
export async function wakeApi(attempts = 2) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await api.get(apiPath("/api/health"), { timeout: 60000 });
      if (res.data?.ok) return true;
    } catch {
      /* retry */
    }
    if (i < attempts - 1) {
      await new Promise((r) => setTimeout(r, 4000));
    }
  }
  return false;
}

export function networkErrorMessage(err) {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.status === 404) {
    return "API route not found. Check REACT_APP_API_URL on Netlify matches your Render URL.";
  }
  if (err.response?.status) {
    return `Request failed (${err.response.status}). Try again.`;
  }
  if (err.code === "ECONNABORTED") {
    return "Server is slow to respond (Render waking up). Wait 30s and try again.";
  }
  return "Cannot reach the API. Wait ~30s for Render to wake, then try again.";
}
