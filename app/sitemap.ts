import type { MetadataRoute } from 'next'
import { getAllBlogPostsFromDb } from '@/lib/blog-db'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://salonrink.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = new URL(siteUrl)

  const blogPosts = await getAllBlogPostsFromDb()
  const blogUrls = blogPosts.map(post => ({
    url: new URL(`/blog/${post.slug}`, baseUrl).toString(),
    lastModified: new Date(post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl.toString(),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: new URL('/register', baseUrl).toString(),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: new URL('/login', baseUrl).toString(),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: new URL('/features', baseUrl).toString(),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: new URL('/pricing', baseUrl).toString(),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: new URL('/company', baseUrl).toString(),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: new URL('/privacy', baseUrl).toString(),
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: new URL('/tokusho', baseUrl).toString(),
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: new URL('/blog', baseUrl).toString(),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...blogUrls,
  ]
}
