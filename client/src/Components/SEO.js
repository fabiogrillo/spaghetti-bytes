import { Helmet } from 'react-helmet-async';

const SEO = ({
  title,
  description,
  image,
  url,
  type = 'website',
  article = null,
  noindex = false,
}) => {
  const siteName = 'Spaghetti Bytes';
  const defaultDescription = 'A tech blog about software engineering, machine learning, and untangling complex code problems. Written by a developer on the journey to FAANG.';
  const defaultImage = '/og-image.png'; // You should create this image
  const siteUrl = process.env.REACT_APP_SITE_URL || 'https://spaghettibytes.blog';

  const seo = {
    title: title ? `${title} | ${siteName}` : siteName,
    description: description || defaultDescription,
    image: image || `${siteUrl}${defaultImage}`,
    url: url || siteUrl,
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <link rel="canonical" href={seo.url} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />

      {/* Article specific (for blog posts) */}
      {article && (
        <>
          <meta property="article:published_time" content={article.publishedAt} />
          <meta property="article:author" content={article.author || 'Fabio Grillo'} />
          {article.tags?.map((tag, i) => (
            <meta property="article:tag" content={tag} key={i} />
          ))}
        </>
      )}
    </Helmet>
  );
};

export default SEO;
