/**
 * SalonRink プラン定義・マッピング
 *
 * プラン名は複数の表記で管理される:
 * - LP表記: フリーランス / スタンダード / プロ （顧客向けUI）
 * - Stripe内部名: basic / small / medium / free （決済API）
 * - DB値: freelance / standard / pro / free （salons.plan, subscriptions.plan）
 *
 * このファイルは3つの表記を統一管理するための真実のソース。
 */

export const PLANS = {
  FREELANCE: {
    // LP表記
    displayName: 'フリーランス',
    // Stripe内部名（price ID 環境変数のキー）
    stripeId: 'basic',
    // DB保存値
    dbValue: 'freelance',
    // 価格
    price: 980,
    currency: '¥',
    description: 'ソロオーナー向け',
  },
  STANDARD: {
    displayName: 'スタンダード',
    stripeId: 'small',
    dbValue: 'standard',
    price: 2480,
    currency: '¥',
    description: '小規模店舗向け',
    popular: true,
  },
  PRO: {
    displayName: 'プロ',
    stripeId: 'medium',
    dbValue: 'pro',
    price: 3980,
    currency: '¥',
    description: 'HPB同期・中〜大規模向け',
  },
  FREE: {
    displayName: '永久無料プラン',
    stripeId: 'free',
    dbValue: 'free',
    price: 0,
    currency: '¥',
    description: '招待コード利用時',
  },
} as const

/**
 * Stripe内部名（basic/small/medium/free）から
 * プラン定義オブジェクトを取得
 */
export function getPlanByStripeId(stripeId: string) {
  return Object.values(PLANS).find((p) => p.stripeId === stripeId)
}

/**
 * DB値（freelance/standard/pro/free）から
 * プラン定義オブジェクトを取得
 */
export function getPlanByDbValue(dbValue: string) {
  return Object.values(PLANS).find((p) => p.dbValue === dbValue)
}

/**
 * プラン定義配列（表示順序）
 */
export const PLAN_ARRAY = [PLANS.FREELANCE, PLANS.STANDARD, PLANS.PRO, PLANS.FREE]

/**
 * 有料プランの配列（FREE除外）
 */
export const PAID_PLANS = [PLANS.FREELANCE, PLANS.STANDARD, PLANS.PRO]
