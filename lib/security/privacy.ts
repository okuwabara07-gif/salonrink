/**
 * SalonRink Privacy & Security
 * 個人情報保護・機密情報マスキング関数群
 *
 * 責務:
 * - 顧客名マスキング（姓のみ or イニシャル）
 * - 機密情報の redact（将来）
 * - AI 入力用 sanitize（将来）
 * - ログ用 masking（将来）
 */

/**
 * 顧客名をマスキング（姓のみ or イニシャル）
 *
 * A2 ルール: 顧客名は生名禁止、イニシャル化必須
 *
 * @param fullName - 顧客フルネーム（"佐藤 結衣", "佐藤結衣", "T.T" など）
 * @returns マスク済み名前（"佐藤", "佐", "T.T", "—" など）
 *
 * @example
 * maskCustomerName("佐藤 結衣")  // "佐藤"
 * maskCustomerName("佐藤結衣")    // "佐"
 * maskCustomerName("T.T")         // "T.T"
 * maskCustomerName("T")           // "T"
 * maskCustomerName(null)          // "—"
 */
export function maskCustomerName(fullName: string | null): string {
  if (!fullName || fullName.length === 0) {
    return '—'
  }

  // スペース区切り（"佐藤 結衣" → "佐藤"）
  if (fullName.includes(' ')) {
    return fullName.split(' ')[0]
  }

  // スペースなし、2文字以上、イニシャルでない（"佐藤結衣" → "佐"）
  if (fullName.length > 1 && !fullName.includes('.')) {
    return fullName.charAt(0)
  }

  // イニシャル or 1文字（"T.T", "T" → そのまま）
  return fullName
}
