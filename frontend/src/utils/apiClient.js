import axios from "axios";
import { apiPath } from "../config/api";

export const api = axios.create({ timeout: 90000 });

/** Ping health until Render wakes (free tier) or give up. */
export async function wakeApi(attempts = 3) {
  const url = apiPath("/api/health");
  for (let i = 0; i < attempts; i++) {
    try {
      await api.get(url, { timeout: 60000 });
      return true;
    } catch {
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 4000));
      }
    }
  }
  return false;
}

export function networkErrorMessage(err) {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.status === 404) {
    return "API not found. Check Netlify env and redeploy.";
  }
  if (err.response?.status) {
    return `Request failed (${err.response.status}). Try again in a moment.`;
  }
  if (err.code === "ECONNABORTED") {
    return "Server is waking up (Render free tier). Wait a moment and try again.";
  }
  return "Cannot reach the server. Wait ~30s for Render to wake, then try again.";
}
