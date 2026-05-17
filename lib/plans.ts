/**
 * SalonRink プラン定義・マッピング(単一の真実のソース / Phase2 canonical)
 *
 * 識別子は Stripeスラッグ basic/small/medium/free に統一。
 * - displayName  : 顧客UI/LP表記 = Light / Standard / Premium
 * - stripeId     : Stripe内部名(price ID 環境変数キー) basic/small/medium/free
 * - dbValue      : salons.plan / subscriptions.plan ( = stripeId に統一 )
 * - price        : 月額(税込) LP整合 1980 / 2980 / 4580
 * - aiQuota      : 月次AI生成上限(全api_type合計のハードキャップ)
 *
 * 旧DB値(freelance/standard/pro)は getPlanByDbValue でレガシー解決のみ対応。
 */

export const PLANS = {
  FREELANCE: {
    displayName: 'Light',
    stripeId: 'basic',
    dbValue: 'basic',
    price: 1980,
    currency: '¥',
    description: 'ソロオーナー向け',
    aiQuota: 200,
  },
  STANDARD: {
    displayName: 'Standard',
    stripeId: 'small',
    dbValue: 'small',
    price: 2980,
    currency: '¥',
    description: '小規模店舗向け',
    popular: true,
    aiQuota: 600,
  },
  PRO: {
    displayName: 'Premium',
    stripeId: 'medium',
    dbValue: 'medium',
    price: 4580,
    currency: '¥',
    description: 'HPB同期・中〜大規模向け',
    aiQuota: 2000,
  },
  FREE: {
    displayName: 'トライアル / 招待',
    stripeId: 'free',
    dbValue: 'free',
    price: 0,
    currency: '¥',
    description: '14日間トライアル・招待コード利用時',
    aiQuota: 50,
  },
} as const

const LEGACY_DB_VALUE_ALIAS: Record<string, string> = {
  freelance: 'basic',
  standard: 'small',
  pro: 'medium',
  free: 'free',
}

/**
 * Stripe内部名（basic/small/medium/free）から
 * プラン定義オブジェクトを取得
 */
export function getPlanByStripeId(stripeId: string) {
  return Object.values(PLANS).find((p) => p.stripeId === stripeId)
}

/**
 * DB値から プラン定義オブジェクトを取得
 * 新DB値(basic/small/medium/free)を解決。旧値(freelance/standard/pro)もレガシー対応。
 */
export function getPlanByDbValue(dbValue: string) {
  const resolved = LEGACY_DB_VALUE_ALIAS[dbValue] ?? dbValue
  return Object.values(PLANS).find((p) => p.dbValue === resolved)
}

/**
 * AI月次枠を取得（DB値ベース。未知/未設定/null は FREE 相当=50）
 */
export function getAIQuotaByDbValue(dbValue: string | null | undefined): number {
  if (!dbValue) return PLANS.FREE.aiQuota
  const plan = getPlanByDbValue(dbValue)
  return plan?.aiQuota ?? PLANS.FREE.aiQuota
}

/**
 * プラン定義配列（表示順序）
 */
export const PLAN_ARRAY = [PLANS.FREELANCE, PLANS.STANDARD, PLANS.PRO, PLANS.FREE]

/**
 * 有料プランの配列（FREE除外）
 */
export const PAID_PLANS = [PLANS.FREELANCE, PLANS.STANDARD, PLANS.PRO]
