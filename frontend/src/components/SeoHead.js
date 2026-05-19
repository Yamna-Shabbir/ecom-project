import { Helmet } from "react-helmet";
import { SITE_NAME, DEFAULT_DESCRIPTION } from "../constants/seo";

function SeoHead({
  title = SITE_NAME,
  description = DEFAULT_DESCRIPTION,
  keywords = "handmade, crochet, pakistan, gifts, home decor",
  robots = "index,follow",
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = "website",
  jsonLd,
}) {
  const shareTitle = ogTitle || title;
  const shareDescription = ogDescription || description;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />
      {canonical && <link rel="canonical" href={canonical} />}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={shareTitle} />
      <meta property="og:description" content={shareDescription} />
      {canonical && <meta property="og:url" content={canonical} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta name="twitter:card" content={ogImage ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={shareTitle} />
      <meta name="twitter:description" content={shareDescription} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}

export default SeoHead;
