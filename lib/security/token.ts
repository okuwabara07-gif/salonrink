/**
 * SalonRink Pre-Counseling Token Security
 * 事前カウンセリングの token 生成・検証関数
 *
 * 責務:
 * - セキュアな token 生成（crypto.randomBytes）
 * - token 形式検証
 * - token 有効期限チェック
 * - DB 経由での token 検証（認可チェック含む）
 */

import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { PreCounseling, PreCounselingError } from '@/types/pre-counseling'

// ========================================
// 型定義
// ========================================

/**
 * Token 検証結果
 */
export interface ValidationResult {
  valid: boolean;
  error?: PreCounselingError;
  preCounseling?: PreCounseling;
}

// ========================================
// 定数
// ========================================

const TOKEN_LENGTH = 24; // bytes（hex で 48 文字）
const TOKEN_VALIDITY_HOURS = 72; // 72 時間有効

// ========================================
// 1. Token 生成
// ========================================

/**
 * セキュアな token を生成
 * crypto.randomBytes(24) で 192 ビットのランダムバイト列を生成し、hex 文字列に変換
 *
 * @returns 48 文字の hex 文字列（URL safe）
 *
 * @example
 * const token = generateSecureToken()
 * // "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4"
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(TOKEN_LENGTH).toString('hex')
}

// ========================================
// 2. Token 形式検証
// ========================================

/**
 * Token の形式が正しいか検証
 * 48 文字の 16 進数文字列であることを確認
 *
 * @param token - 検証対象の token
 * @returns 形式が正しければ true、そうでなければ false
 *
 * @example
 * isValidTokenFormat('a1b2c3d4e5f6...') // true
 * isValidTokenFormat('invalid') // false
 */
export function isValidTokenFormat(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false
  }

  // 48 文字で、全て 16 進数
  if (token.length !== TOKEN_LENGTH * 2) {
    return false
  }

  return /^[0-9a-f]{48}$/i.test(token)
}

// ========================================
// 3. Token 有効期限チェック
// ========================================

/**
 * Token が有効期限内かを判定
 *
 * 有効期限ルール:
 * - reservationDate が指定されている場合: 来店当日の 23:59:59 まで有効
 * - reservationDate が null/undefined の場合: 送信から 72 時間以内
 *
 * @param sentAt - token 送信日時（ISO 8601 形式）
 * @param reservationDate - 予約日（オプション、ISO 8601 date 形式）
 * @returns 期限切れなら true、有効なら false
 *
 * @example
 * isTokenExpired('2026-05-02T10:00:00Z', '2026-05-05') // false（来店当日まで有効）
 * isTokenExpired('2026-05-02T10:00:00Z') // false（72 時間以内）
 */
export function isTokenExpired(
  sentAt: string,
  reservationDate?: string | null
): boolean {
  const sentTime = new Date(sentAt).getTime()
  const now = new Date().getTime()

  if (reservationDate) {
    // 来店当日の 23:59:59 までを有効期限とする
    const resDate = new Date(reservationDate)
    const endOfDay = new Date(
      resDate.getFullYear(),
      resDate.getMonth(),
      resDate.getDate(),
      23,
      59,
      59,
      999
    ).getTime()

    return now > endOfDay
  }

  // 送信から 72 時間以内
  const expiryTime = sentTime + TOKEN_VALIDITY_HOURS * 60 * 60 * 1000
  return now > expiryTime
}

// ========================================
// 4. Token 統合検証
// ========================================

/**
 * Token の形式・有効期限・DB 存在確認を行う統合検証
 *
 * 検証ステップ:
 * 1. 形式チェック
 * 2. DB 内のレコード存在確認（Supabase RLS で salon_id/owner_user_id チェック）
 * 3. 有効期限チェック
 * 4. ステータスチェック（already submitted でないか）
 *
 * @param token - 検証対象の token
 * @returns ValidationResult（valid, error, preCounseling）
 *
 * @example
 * const result = await validatePreCounselingToken(token)
 * if (result.valid) {
 *   console.log(result.preCounseling)
 * } else {
 *   console.error(result.error)
 * }
 */
export async function validatePreCounselingToken(
  token: string
): Promise<ValidationResult> {
  // Step 1: 形式チェック
  if (!isValidTokenFormat(token)) {
    return {
      valid: false,
      error: 'INVALID_TOKEN'
    }
  }

  // Step 2: DB レコード存在確認
  let supabase
  try {
    supabase = await createClient()
  } catch (err) {
    console.error('Failed to create Supabase client:', err)
    return {
      valid: false,
      error: 'INTERNAL_ERROR'
    }
  }

  const { data: preCounseling, error: dbError } = await supabase
    .from('pre_counselings')
    .select('*')
    .eq('token', token)
    .maybeSingle()

  if (dbError) {
    console.error('Database error:', dbError)
    return {
      valid: false,
      error: 'INTERNAL_ERROR'
    }
  }

  if (!preCounseling) {
    return {
      valid: false,
      error: 'NOT_FOUND'
    }
  }

  // Step 3: 有効期限チェック（Phase 1.5: reservations テーブル未作成のため 72 時間ルールのみ）
  if (preCounseling.sent_at && isTokenExpired(preCounseling.sent_at)) {
    return {
      valid: false,
      error: 'EXPIRED_TOKEN'
    }
  }

  // Step 4: ステータスチェック（既に回答送信済みか）
  if (preCounseling.status === 'submitted' || preCounseling.status === 'analyzed' || preCounseling.status === 'reviewed') {
    return {
      valid: false,
      error: 'ALREADY_SUBMITTED'
    }
  }

  // すべてのチェック合格
  return {
    valid: true,
    preCounseling: preCounseling as PreCounseling
  }
}
