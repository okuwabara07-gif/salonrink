// lib/menuPricingAlias.ts
// alias 層(Step 3-1)。menuPricing.ts は一切改変せず既存 export を包むだけ。
// alias 未指定/空 -> resolveMenuPriceLayered と完全同一(後方互換)。
import {
  resolveMenuPriceLayered,
  resolveMenuDuration,
  type MenuMaster,
} from './menuPricing';

export type AliasHit =
  | { kind: 'price'; price: number; duration?: number | null }
  | { kind: 'ignored' };

export function resolveMenuPriceWithAlias(
  menuName: string | null | undefined,
  alias: Map<string, AliasHit> | null | undefined,
  catalog: MenuMaster[] | null | undefined,
  masters: MenuMaster[] | null | undefined
): number | null {
  if (menuName && alias) {
    const hit = alias.get(menuName.trim());
    if (hit) {
      if (hit.kind === 'ignored') return null;
      if (typeof hit.price === 'number') return hit.price;
    }
  }
  return resolveMenuPriceLayered(menuName, catalog, masters);
}

export function resolveMenuDurationWithAlias(
  menuName: string | null | undefined,
  alias: Map<string, AliasHit> | null | undefined,
  masters: MenuMaster[] | null | undefined,
  fallback = 60
): number {
  if (menuName && alias) {
    const hit = alias.get(menuName.trim());
    if (hit && hit.kind === 'price' && typeof hit.duration === 'number' && hit.duration > 0) {
      return hit.duration;
    }
  }
  return resolveMenuDuration(menuName, masters, fallback);
}
