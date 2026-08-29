/**
 * lib/api/response.ts
 *
 * API エンドポイント共通レスポンス形式
 * NextResponse を返す関数群
 * 使用: Sprint 1 (menus), Sprint 2 (kpi) 等
 */

import { NextResponse } from 'next/server'
import type { ApiResponse } from '@/lib/menus/schema'

/**
 * 成功レスポンス
 * @param data レスポンスボディ
 * @param statusCode HTTP ステータスコード (デフォルト: 200)
 */
export function successResponse<T>(data: T, statusCode: number = 200): NextResponse {
  const response: ApiResponse<T> = { data, error: null }
  return NextResponse.json(response, { status: statusCode })
}

/**
 * エラーレスポンス
 * @param error エラーメッセージ
 * @param statusCode HTTP ステータスコード (デフォルト: 400)
 */
export function errorResponse<T = null>(error: string, statusCode: number = 400): NextResponse {
  const response: ApiResponse<T> = { data: null, error }
  return NextResponse.json(response, { status: statusCode })
}
