// lib/menuPricing.ts
// 予約メニュー名 -> 価格 / 所要時間 を salon_menus マスタから解決する共有ロジック。
//
// 背景:
//   home / booking / cons(page+API)/ customers に分散していた固定 MENU_PRICE
//   ('カラー': 6800 等)+ DEFAULT_PRICE 5000 フォールバックが、HPB の長文
//   メニュー名に部分一致して誤価格を表示し、売上見込KPIを過大化させていた。
//   これを一本化し「マスタに無ければ価格を出さない」へ統一する。
//
// 名寄せ方針(Step 3-0b 改訂):
//   HPB の menu_name は「ナチュラル成分配合で…根元染め」のように
//   スペースや「+」を含む“1サービスの冗長名”が大半。よって分割せず、
//   メニュー名“全体”に対してマスタ登録名が部分一致するかで判定する。
//   - マスタ登録名が予約メニュー名(全体)に含まれる(substring)かで照合
//   - 複数候補がマッチした場合は最長一致(より具体的なマスタ名)を採用
//     → 例: 「根元染め」と「プレミアムカラー根元染め」を両方登録すると、
//       プレミアム系予約は後者(長い=具体的)が優先され価格帯を出し分け可能
//   - どのマスタ名も含まれない / マスタ空 / メニュー名空 -> null
//     null は「価格を確定できない」を意味し、UI は - 表示、
//     売上見込などの集計では加算対象から除外する(推定額を出さない)
//
// 設計:
//   - Supabase 非依存の純関数。client / server 双方から利用可
//   - salon_menus 行の取得・salon_id 絞りは呼び出し側の責務(本modは計算のみ)
//   - 旧版(Step 3-0)とエクスポート/シグネチャは完全互換。呼び出し側は無改変。

export interface MenuMaster {
  name: string;
  price: number;
  duration?: number | null;
}

// メニュー名(全体)に対し、登録名が含まれるマスタのうち
// 最長名のものを返す。分割は行わない(HPB 冗長名 = 1 サービス前提)。
function bestMasterFor(
  menuName: string,
  masters: MenuMaster[]
): MenuMaster | null {
  const hay = (menuName || '').trim();
  if (!hay) return null;
  let best: MenuMaster | null = null;
  let bestLen = -1;
  for (const m of masters) {
    const name = (m.name || '').trim();
    if (!name) continue;
    if (!hay.includes(name)) continue;
    if (name.length > bestLen) {
      best = m;
      bestLen = name.length;
    }
  }
  return best;
}

/**
 * 予約メニュー名から価格を解決する。
 * - メニュー名“全体”に対する最長部分一致マスタの price を返す
 * - 一致無し / マスタ空 / メニュー名空 -> null(価格不確定)
 *
 * null は「価格を確定できない」を意味する。呼び出し側は - 表示にし、
 * 売上見込などの集計では加算対象から除外すること(推定額を入れない)。
 */
export function resolveMenuPrice(
  menuName: string | null | undefined,
  masters: MenuMaster[] | null | undefined
): number | null {
  if (!menuName || !masters || masters.length === 0) return null;
  const m = bestMasterFor(menuName, masters);
  if (!m || typeof m.price !== 'number') return null;
  return m.price;
}

/**
 * 所要時間を解決する。
 * タイムライン等のレイアウト崩れを防ぐため null は返さず必ず数値を返す。
 * 最長一致マスタの duration を使い、無ければ fallback。
 * (価格と異なり「不確定なら描画できない」ため安全側の既定値で継続)
 */
export function resolveMenuDuration(
  menuName: string | null | undefined,
  masters: MenuMaster[] | null | undefined,
  fallback = 60
): number {
  if (!menuName) return fallback;
  const m = masters ? bestMasterFor(menuName, masters) : null;
  if (m && typeof m.duration === 'number' && m.duration > 0) {
    return m.duration;
  }
  return fallback;
}

/**
 * salon_menus 行 -> MenuMaster へのマッパ。
 * 各画面の取得処理で .map(toMenuMaster) して使う。
 */
export function toMenuMaster(row: {
  name: string;
  price: number;
  duration?: number | null;
}): MenuMaster {
  return {
    name: row.name,
    price: row.price,
    duration: row.duration ?? null,
  };
}
