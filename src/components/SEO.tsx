import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE_URL, defaultSEO, DEFAULT_IMAGE, SITE_NAME } from '../config/seo';

type SEOProps = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  noindex?: boolean;
  jsonLd?: object;
  canonical?: string;
};

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image = DEFAULT_IMAGE,
  url,
  noindex = false,
  jsonLd,
  canonical,
}) => {
  const pageUrl = url?.startsWith('http') ? url : `${SITE_URL}${url || ''}`;
  const pageTitle = title || defaultSEO.defaultTitle;
  const pageDescription = description || defaultSEO.description;
  const canonicalUrl = canonical || pageUrl;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD */}
      {(jsonLd || true) && (
        <script type="application/ld+json">
          {JSON.stringify(
            jsonLd || {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: SITE_NAME,
              url: SITE_URL,
              logo: `${SITE_URL}/s-favicon.svg`,
            }
          )}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
