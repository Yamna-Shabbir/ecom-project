import { useState } from "react";
import { Link } from "react-router-dom";
import SeoHead from "../components/SeoHead";
import { SITE_URL, utmShopUrl } from "../constants/seo";
import { getParasiteTemplates, TARGET_KEYWORDS } from "../data/parasiteSeoTemplates";
import { SEO_ARTICLES } from "../data/seoArticles";
import { buildCanonical } from "../constants/seo";

function AdminParasiteSeo() {
  const templates = getParasiteTemplates();
  const [copied, setCopied] = useState("");
  const [utmSource, setUtmSource] = useState("pinterest");
  const [utmCampaign, setUtmCampaign] = useState("spring-handmade");

  const customLink = utmShopUrl({
    source: utmSource,
    medium: "social",
    campaign: utmCampaign,
    content: "admin-tool",
  });

  const copy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      setCopied("err");
    }
  };

  return (
    <div className="page parasite-seo-page">
      <SeoHead
        title="Parasite SEO Toolkit | Admin | Gülkaar"
        description="Copy-ready posts for Pinterest, Medium, Reddit and more."
        robots="noindex,nofollow"
      />
      <div className="page-header">
        <h1>Parasite SEO toolkit</h1>
        <p>
          Publish helpful content on high-traffic platforms and link back to your shop with tracked URLs.
        </p>
      </div>

      <section className="parasite-section">
        <h2>Your shop links</h2>
        <p className="parasite-muted">Site: <strong>{SITE_URL}</strong></p>
        <div className="parasite-link-box">
          <code>{customLink}</code>
          <button type="button" className="btn-outline" onClick={() => copy(customLink, "custom")}>
            {copied === "custom" ? "Copied!" : "Copy UTM link"}
          </button>
        </div>
        <div className="parasite-utm-row">
          <label>
            utm_source
            <input value={utmSource} onChange={(e) => setUtmSource(e.target.value)} />
          </label>
          <label>
            utm_campaign
            <input value={utmCampaign} onChange={(e) => setUtmCampaign(e.target.value)} />
          </label>
        </div>
      </section>

      <section className="parasite-section">
        <h2>Target keywords</h2>
        <ul className="parasite-keywords">
          {TARGET_KEYWORDS.map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ul>
      </section>

      <section className="parasite-section">
        <h2>On-site SEO pages (public)</h2>
        <p className="parasite-muted">These pages are indexable — share them on social too.</p>
        <ul className="parasite-links-list">
          <li><a href={buildCanonical("/discover")} target="_blank" rel="noreferrer">/discover</a></li>
          {SEO_ARTICLES.map((a) => (
            <li key={a.slug}>
              <a href={buildCanonical(`/discover/${a.slug}`)} target="_blank" rel="noreferrer">
                /discover/{a.slug}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="parasite-section">
        <h2>Platform post templates</h2>
        <p className="parasite-muted">Copy, customize, publish — always add value, not spam.</p>
        <div className="parasite-grid">
          {templates.map((t) => (
            <div key={t.id} className="parasite-card">
              <div className="parasite-card-head">
                <span className="parasite-card-icon">{t.icon}</span>
                <h3>{t.platform}</h3>
              </div>
              <p className="parasite-tip">{t.tip}</p>
              <pre className="parasite-template">{t.template}</pre>
              <button
                type="button"
                className="btn-primary"
                onClick={() => copy(t.template, t.id)}
              >
                {copied === t.id ? "Copied!" : "Copy post"}
              </button>
            </div>
          ))}
        </div>
      </section>

      <p className="discover-cta">
        <Link to="/dashboard">← Back to dashboard</Link>
      </p>
    </div>
  );
}

export default AdminParasiteSeo;
