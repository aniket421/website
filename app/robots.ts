import type { MetadataRoute } from 'next';
import { site } from '@/lib/data/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The admin and the API have no business in a search index.
      disallow: ['/admin', '/api/'],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
