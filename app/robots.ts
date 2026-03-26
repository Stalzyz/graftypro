import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { SystemConfigService } from '../lib/services/system-config-service';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerList = headers();
  const host = headerList.get("x-request-host") || headerList.get("host") || "";
  let sitemapUrl = host ? `https://${host}/sitemap.xml` : 'https://grafty.pro/sitemap.xml';
  
  try {
    const config = await SystemConfigService.getConfig() as any;
    if (config?.sitemap_url) {
        sitemapUrl = config.sitemap_url;
    }
  } catch (error) {
    console.warn("[Build-Robots] Could not fetch system config, using default sitemap URL.");
  }
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/api/',
        '/super-admin/',
        '/_next/',
        '/checkout/success',
        '/checkout/cancel',
      ],
    },
    sitemap: sitemapUrl,
  };
}
