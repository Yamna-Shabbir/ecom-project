import { Link } from "react-router-dom";
import SeoHead from "../components/SeoHead";
import { buildCanonical } from "../constants/seo";
import { SEO_ARTICLES } from "../data/seoArticles";

function DiscoverIndex() {
  return (
    <div className="page discover-page">
      <SeoHead
        title="Handmade Guides & Gift Ideas | Gülkaar"
        description="SEO guides on crochet flowers, handmade home décor, and gifts in Pakistan. Discover Gülkaar artisan shop."
        keywords="handmade guides, crochet pakistan, handmade gifts, gulkaar"
        canonical={buildCanonical("/discover")}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Gülkaar Handmade Guides",
          description: "Guides about handmade crochet and gifts in Pakistan",
          url: buildCanonical("/discover"),
        }}
      />
      <div className="page-header">
        <h1>Handmade guides</h1>
        <p>Tips on crochet décor & gifts in Pakistan — shop at Gülkaar when you are ready.</p>
      </div>
      <div className="discover-grid">
        {SEO_ARTICLES.map((a) => (
          <Link key={a.slug} to={`/discover/${a.slug}`} className="discover-card">
            <h2>{a.title}</h2>
            <p>{a.description}</p>
            <span className="discover-card-link">Read guide →</span>
          </Link>
        ))}
      </div>
      <p className="discover-cta">
        <Link to="/register" className="btn-primary">Create account & shop</Link>
        {" · "}
        <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}

export default DiscoverIndex;
