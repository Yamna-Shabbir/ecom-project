import { Link, useParams, Navigate } from "react-router-dom";
import SeoHead from "../components/SeoHead";
import { buildCanonical, SITE_NAME } from "../constants/seo";
import { getArticleBySlug } from "../data/seoArticles";

function DiscoverArticle() {
  const { slug } = useParams();
  const article = getArticleBySlug(slug);

  if (!article) return <Navigate to="/discover" replace />;

  const canonical = buildCanonical(`/discover/${slug}`);

  return (
    <article className="page discover-page">
      <SeoHead
        title={`${article.title} | ${SITE_NAME}`}
        description={article.description}
        keywords={article.keywords}
        canonical={canonical}
        ogType="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.description,
          url: canonical,
          author: { "@type": "Organization", name: SITE_NAME },
        }}
      />
      <p className="discover-breadcrumb">
        <Link to="/discover">Guides</Link> / {article.title}
      </p>
      <header className="page-header">
        <h1>{article.title}</h1>
        <p>{article.description}</p>
      </header>
      <div className="discover-article-body">
        {article.sections.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      <div className="discover-cta discover-cta--box">
        <h2>Shop handmade at {SITE_NAME}</h2>
        <p>Create a free account to browse crochet flowers, décor & gifts with cash on delivery.</p>
        <Link to="/register" className="btn-primary">Start shopping</Link>
      </div>
    </article>
  );
}

export default DiscoverArticle;
