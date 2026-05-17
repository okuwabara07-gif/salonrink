// lib/menuAlias.server.ts
// hpb_menu_alias ⨝ salon_menus を salon_id で取得し AliasHit Map を構築。
// サーバ専用・読み取りのみ。失敗/空は空Map -> 既存チェーンにフォールバック。
import type { AliasHit } from './menuPricingAlias';

export async function loadMenuAliasMap(
  supabase: { from: (t: string) => any },
  salonId: string
): Promise<Map<string, AliasHit>> {
  const map = new Map<string, AliasHit>();
  if (!salonId) return map;

  const { data, error } = await supabase
    .from('hpb_menu_alias')
    .select('hpb_raw_name, status, salon_menus:salon_menu_id ( price, duration )')
    .eq('salon_id', salonId);

  if (error || !data) return map;

  for (const row of data as any[]) {
    const raw = (row.hpb_raw_name || '').trim();
    if (!raw) continue;
    if (row.status === 'ignored') { map.set(raw, { kind: 'ignored' }); continue; }
    if (row.status === 'mapped' && row.salon_menus && typeof row.salon_menus.price === 'number') {
      map.set(raw, {
        kind: 'price',
        price: row.salon_menus.price,
        duration: row.salon_menus.duration ?? null,
      });
    }
  }
  return map;
}
