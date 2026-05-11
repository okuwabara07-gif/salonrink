import { createAdminClient } from '@/lib/supabase/admin'

export interface BlogPost {
  slug: string
  title: string
  date: string
  description: string
  category: string
  content: string
  image_url?: string
  views?: number
}

export async function getBlogPostFromDb(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('blog_articles')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      console.error('[blog-db] Query error:', error?.message)
      return null
    }

    console.log('[blog-db] Retrieved article data:', { slug: data.slug, image_url: data.image_url })

    return {
      slug: data.slug,
      title: data.title,
      date: data.published_at.split('T')[0],
      description: data.excerpt || '',
      category: data.cluster,
      content: data.content,
      image_url: data.image_url,
      views: data.views || 0,
    }
  } catch (error) {
    console.error('[blog-db] Error fetching post:', error)
    return null
  }
}

export async function getAllBlogPostsFromDb(): Promise<BlogPost[]> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('blog_articles')
      .select('*')
      .order('published_at', { ascending: false })

    if (error || !data) {
      return []
    }

    return data.map(article => ({
      slug: article.slug,
      title: article.title,
      date: article.published_at.split('T')[0],
      description: article.excerpt || '',
      category: article.cluster,
      content: article.content,
      image_url: article.image_url,
      views: article.views || 0,
    }))
  } catch (error) {
    console.error('[blog-db] Error fetching posts:', error)
    return []
  }
}

export async function incrementPostViews(slug: string): Promise<void> {
  try {
    const supabase = createAdminClient()
    await supabase.rpc('increment_blog_views', { article_slug: slug })
  } catch (error) {
    console.error('[blog-db] Error incrementing views:', error)
  }
}
