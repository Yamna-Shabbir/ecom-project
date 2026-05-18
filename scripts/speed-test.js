/**
 * Lighthouse speed / quality test for the deployed (or local) site.
 *
 * Usage:
 *   npm run speed-test
 *   SITE_URL=https://your-app.onrender.com API_URL=https://your-api.onrender.com npm run speed-test
 *
 * Reports saved to reports/lighthouse-report.html
 */

const fs = require("fs");
const path = require("path");
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");

const SITE_URL = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const API_URL = (process.env.API_URL || "http://localhost:5000").replace(/\/$/, "");
const REPORT_DIR = path.join(__dirname, "..", "reports");

async function timedFetch(label, url) {
  const start = Date.now();
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  const ms = Date.now() - start;
  return { label, url, ok: res.ok, status: res.status, ms };
}

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless", "--no-sandbox"] });
  try {
    const options = {
      logLevel: "error",
      output: "html",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      port: chrome.port,
    };
    const runner = await lighthouse(url, options);
    return runner;
  } finally {
    await chrome.kill();
  }
}

function scoreBar(score) {
  const pct = Math.round((score || 0) * 100);
  const bar = "█".repeat(Math.round(pct / 10)) + "░".repeat(10 - Math.round(pct / 10));
  return `${bar} ${pct}`;
}

async function main() {
  console.log("\n=== Gulkaar speed test ===\n");
  console.log("Frontend:", SITE_URL);
  console.log("API:     ", API_URL);
  console.log("");

  fs.mkdirSync(REPORT_DIR, { recursive: true });

  // API latency checks
  console.log("--- API response times ---");
  for (const path of ["/api/health", "/api/products"]) {
    try {
      const r = await timedFetch(path, `${API_URL}${path}`);
      console.log(`${r.ok ? "✓" : "✗"} ${path}  ${r.status}  ${r.ms}ms`);
    } catch (err) {
      console.log(`✗ ${path}  failed: ${err.message}`);
    }
  }
  console.log("");

  // Lighthouse (frontend)
  console.log("--- Lighthouse (frontend) ---");
  console.log("Running Lighthouse (may take 30–60s)...\n");

  let result;
  try {
    result = await runLighthouse(SITE_URL);
  } catch (err) {
    console.error("Lighthouse failed:", err.message);
    console.error("\nTip: Start the app first (npm run start:frontend) or set SITE_URL to your live URL.");
    process.exit(1);
  }

  const reportHtml = result.report;
  const reportPath = path.join(REPORT_DIR, "lighthouse-report.html");
  fs.writeFileSync(reportPath, reportHtml);

  const cats = result.lhr.categories;
  console.log("Performance:    ", scoreBar(cats.performance?.score));
  console.log("Accessibility:  ", scoreBar(cats.accessibility?.score));
  console.log("Best practices: ", scoreBar(cats["best-practices"]?.score));
  console.log("SEO:            ", scoreBar(cats.seo?.score));

  const perf = result.lhr.audits;
  const fcp = perf["first-contentful-paint"]?.displayValue;
  const lcp = perf["largest-contentful-paint"]?.displayValue;
  const tbt = perf["total-blocking-time"]?.displayValue;
  const cls = perf["cumulative-layout-shift"]?.displayValue;

  console.log("\nCore metrics:");
  if (fcp) console.log("  First Contentful Paint:", fcp);
  if (lcp) console.log("  Largest Contentful Paint:", lcp);
  if (tbt) console.log("  Total Blocking Time:   ", tbt);
  if (cls) console.log("  Cumulative Layout Shift:", cls);

  console.log(`\nFull HTML report: ${reportPath}\n`);

  const minPerf = Number(process.env.MIN_PERF_SCORE || 0);
  if (minPerf > 0 && (cats.performance?.score || 0) < minPerf) {
    console.error(`Performance score below minimum (${minPerf * 100})`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
