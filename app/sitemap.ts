import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { SOLUTIONS_DATA } from './solutions/solutions-data';
import { COMPARISON_DATA } from './compare/comparison-data';
import { ACADEMY_ARTICLES } from './academy/academy-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const headerList = headers();
  const host = headerList.get("x-request-host") || headerList.get("host") || "grafty.pro";
  const baseUrl = `https://${host}`;

  // Core Pages
  const routes = [
    '',
    '/pricing',
    '/solutions',
    '/reseller-program',
    '/academy',
    '/how-to-use',
    '/join',
    '/privacy',
    '/terms',
    '/affiliate-partner',
    '/platform-partner',
    '/docs',
    '/whatsapp-link-generator',
    '/whatsapp-cost-calculator',
    '/whatsapp-green-tick-checker',
    ...Object.keys(SOLUTIONS_DATA).map(slug => `/solutions/${slug}`),
    ...Object.keys(COMPARISON_DATA).map(slug => `/compare/${slug}`),
    ...Object.keys(ACADEMY_ARTICLES).map(slug => `/academy/${slug}`)
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route.startsWith('/solutions/') ? 0.9 : 0.8,
  }));
}
