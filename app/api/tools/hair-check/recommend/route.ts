/**
 * POST /api/tools/hair-check/recommend
 *
 * 診断結果の悩みタグ(concern_tags)に合うおすすめ製品を返す。
 * - inhouse(サロン発送)を優先。エントリー1品 + セット1品。
 * - affiliate(Amazon/楽天参考)も1品まで。
 * Claude は呼ばない(コスト0)。
 *
 * body: { concern_tags: string[] }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getKireiTsurumiSalonId } from '@/lib/miniapp/verify'

type Product = {
  id: string
  name: string
  brand: string | null
  price: number
  volume: string | null
  image_url: string | null
  effect_text: string | null
  target_hair_types: string[]
  is_set: boolean
  is_entry: boolean
  set_items: string[]
  fulfillment_type: 'inhouse' | 'affiliate'
  ec_url: string | null
}

function matchScore(tags: string[], productTags: string[]): number {
  if (!Array.isArray(productTags)) return 0
  return productTags.filter((t) => tags.includes(t)).length
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}))
    const tags: string[] = Array.isArray(body.concern_tags) ? body.concern_tags : []

    const admin = createAdminClient()
    const salonId = getKireiTsurumiSalonId()

    const { data, error } = await admin
      .from('products')
      .select('id, name, brand, price, volume, image_url, effect_text, target_hair_types, is_set, is_entry, set_items, fulfillment_type, ec_url')
      .eq('salon_id', salonId)
      .eq('is_active', true)
      .eq('agency_locked', false)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('[recommend] query error:', error)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }

    const all = (data || []) as Product[]
    // タグ一致でスコア付け。タグ無しの場合は全件を候補に。
    const scored = all
      .map((p) => ({ p, s: tags.length ? matchScore(tags, p.target_hair_types) : 1 }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.p)

    const inhouse = scored.filter((p) => p.fulfillment_type === 'inhouse')
    const affiliate = scored.filter((p) => p.fulfillment_type === 'affiliate')

    const entry = inhouse.find((p) => p.is_entry && !p.is_set) || null
    const set = inhouse.find((p) => p.is_set) || null
    const ref = affiliate[0] || null

    return NextResponse.json({
      entry,
      set,
      affiliate: ref,
    })
  } catch (e) {
    console.error('[recommend] fatal:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
