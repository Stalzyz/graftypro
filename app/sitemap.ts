import { MetadataRoute } from 'next'
import { INTEGRATIONS_DATA } from './integrations-data'
import { USE_CASES_DATA } from './use-cases-data'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://grafty.pro'
  
  const industries = [
    'education',
    'ecommerce',
    'real-estate',
    'gym-fitness',
    'saloon-spa',
    'restaurants',
    'agencies'
  ]

  const industryUrls = industries.map((ind) => ({
    url: `${baseUrl}/solutions/${ind}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/solutions`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...industryUrls,
    ...Object.keys(INTEGRATIONS_DATA).map((slug) => ({
      url: `${baseUrl}/integrations/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...Object.keys(USE_CASES_DATA).map((slug) => ({
      url: `${baseUrl}/use-cases/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  ]
}
