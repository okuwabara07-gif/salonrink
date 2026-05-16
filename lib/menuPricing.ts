// lib/menuPricing.ts
// 予約メニュー名 -> 価格 / 所要時間 を salon_menus マスタから解決する共有ロジック。
//
// 背景:
//   home / booking / cons(page+API)/ customers に分散していた固定 MENU_PRICE
//   ('カラー': 6800 等)+ DEFAULT_PRICE 5000 フォールバックが、HPB の長文
//   メニュー名に部分一致して誤価格(例: 正価 2500 を 6800)を表示し、売上見込KPIを
//   過大化させていた。これを一本化し「マスタに無ければ価格を出さない」へ統一する。
//
// 名寄せ方針(申し送り合意):
//   - マスタ登録名が予約メニュー名に含まれる(substring)かで照合
//   - 複数候補がマッチした場合は最長一致(より具体的なマスタ名)を採用
//   - 価格が確定できない場合は null を返す(UI 側で - 表示。推定額は出さない)
//   - マスタが空(0件)なら常に null = 全予約 - 表示(誤った 6800 を出さない)
//
// 設計:
//   - Supabase 非依存の純関数。client コンポーネントからも server route からも利用可
//   - salon_menus 行の取得・salon_id 絞りは呼び出し側の責務(本モジュールは計算のみ)

export interface MenuMaster {
  name: string;
  price: number;
  duration?: number | null;
}

// 複数施術("カット+カラー" 等)の区切り文字。HPB の長文単一名は分解されず
// 全体が 1 トークンとして substring 照合される。
const DELIMITERS = /[,、，\+＋\/／･・\s]+/;

function tokenize(menuName: string): string[] {
  const tokens = menuName
    .split(DELIMITERS)
    .map((s) => s.trim())
    .filter(Boolean);
  // 区切りが無い長文(HPB 名等)は全体を 1 トークンとして扱う
  return tokens.length > 0 ? tokens : [menuName.trim()].filter(Boolean);
}

// トークンに対し、登録名が含まれるマスタのうち最長名のものを返す。
// 「マスタ登録名が予約名に含まれる」方向のみで判定(申し送り合意の名寄せ)。
function bestMasterFor(
  token: string,
  masters: MenuMaster[]
): MenuMaster | null {
  if (!token) return null;
  let best: MenuMaster | null = null;
  let bestLen = -1;
  for (const m of masters) {
    const name = (m.name || '').trim();
    if (!name) continue;
    if (!token.includes(name)) continue;
    if (name.length > bestLen) {
      best = m;
      bestLen = name.length;
    }
  }
  return best;
}

/**
 * 予約メニュー名から合計価格を解決する。
 * - 区切り文字で分解し、各トークンをマスタ照合
 * - 全トークンがマッチ -> 合計を返す
 * - 1 つでも未マッチ / マスタ空 / メニュー名空 -> null(価格不確定)
 *
 * null は「価格を確定できない」を意味する。呼び出し側は - 表示にし、
 * 売上見込などの集計では加算対象から除外すること(推定額を入れない)。
 */
export function resolveMenuPrice(
  menuName: string | null | undefined,
  masters: MenuMaster[] | null | undefined
): number | null {
  if (!menuName || !masters || masters.length === 0) return null;
  const tokens = tokenize(menuName);
  if (tokens.length === 0) return null;
  let total = 0;
  for (const tk of tokens) {
    const m = bestMasterFor(tk, masters);
    if (!m || typeof m.price !== 'number') return null; // 1 つでも不確定なら全体不確定
    total += m.price;
  }
  return total;
}

/**
 * 所要時間を解決する。
 * タイムライン等のレイアウト崩れを防ぐため null は返さず必ず数値を返す。
 * マッチしたマスタの duration を合算し、未マッチ分は fallback を加算する。
 * (価格と異なり「不確定なら描画できない」ため、duration は安全側の既定値で継続)
 */
export function resolveMenuDuration(
  menuName: string | null | undefined,
  masters: MenuMaster[] | null | undefined,
  fallback = 60
): number {
  if (!menuName) return fallback;
  const tokens = tokenize(menuName);
  if (tokens.length === 0) return fallback;
  let total = 0;
  for (const tk of tokens) {
    const m = masters ? bestMasterFor(tk, masters) : null;
    const d =
      m && typeof m.duration === 'number' && m.duration > 0
        ? m.duration
        : fallback;
    total += d;
  }
  return total > 0 ? total : fallback;
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
