/**
 * GET /api/miniapp/products
 * 公開中の製品一覧を返す(is_active かつ agency_locked=false)。
 */
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getKireiTsurumiSalonId } from '@/lib/miniapp/verify'

export async function GET(): Promise<NextResponse> {
  try {
    const admin = createAdminClient()
    const salonId = getKireiTsurumiSalonId()
    const { data, error } = await admin
      .from('products')
      .select('id, name, brand, price, volume, image_url, is_set, fulfillment_type, is_entry')
      .eq('salon_id', salonId)
      .eq('is_active', true)
      .eq('agency_locked', false)
      .order('sort_order', { ascending: true })
    if (error) {
      console.error('[miniapp/products list] error:', error)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
    return NextResponse.json({ products: data || [] })
  } catch (e) {
    console.error('[miniapp/products list] fatal:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
