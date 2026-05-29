/**
 * GET /api/miniapp/products/[id]
 * 製品1件 + 承認済み口コミ + 平均評価を返す。公開情報のみ。
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await ctx.params
    const admin = createAdminClient()

    const { data: product, error } = await admin
      .from('products')
      .select('id, name, brand, category, price, volume, image_url, image_urls, effect_text, usage_text, is_set, set_items, stock, fulfillment_type, ec_url, is_active, agency_locked')
      .eq('id', id)
      .maybeSingle()

    if (error || !product || !product.is_active || product.agency_locked) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { data: reviews } = await admin
      .from('product_reviews')
      .select('id, rating, body, created_at')
      .eq('product_id', id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(20)

    const list = reviews || []
    const avg = list.length
      ? Math.round((list.reduce((s, r) => s + r.rating, 0) / list.length) * 10) / 10
      : null

    return NextResponse.json({
      product,
      reviews: list,
      review_count: list.length,
      review_avg: avg,
    })
  } catch (e) {
    console.error('[miniapp/products/[id]] fatal:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
