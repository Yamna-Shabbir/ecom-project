import { Helmet } from "react-helmet";

function SeoHead({
  title = "Gulkaar",
  description = "Handmade e-commerce store",
  keywords = "handmade, crochet, e-commerce",
  robots = "index,follow",
  ogTitle,
  ogDescription,
  ogImage,
}) {
  const shareTitle = ogTitle || title;
  const shareDescription = ogDescription || description;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />
      <meta property="og:title" content={shareTitle} />
      <meta property="og:description" content={shareDescription} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={shareTitle} />
      <meta name="twitter:description" content={shareDescription} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
}

export default SeoHead;
