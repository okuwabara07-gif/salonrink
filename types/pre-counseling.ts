/**
 * SalonRink Pre-Counseling Types
 * 事前カウンセリング機能の型定義
 *
 * 対応テーブル: pre_counselings
 * Migration: supabase/migrations/20260510_pre_counselings.sql
 *
 * 設計方針:
 * - メイン型は Record<string, any> で柔軟性優先（既存 Karte 型パターン継承）
 * - 構造ヒント型（PreCounselingAnswers, AIAnalysisResult）で開発時の型安全性確保
 * - API 型（Request/Response）で明確な型チェック
 */

// ========================================
// 1. ステータス型
// ========================================
export type PreCounselingStatus =
  | 'pending'       // 作成済み、未送信
  | 'sent'          // LINE/メール送信済み
  | 'opened'        // LIFF 開封済み
  | 'submitted'     // 回答送信済み
  | 'analyzed'      // AI 解析完了
  | 'reviewed';     // 美容師確認済み

// ========================================
// 2. アンケート選択肢型（構造ヒント）
// ========================================

// 髪のお悩みオプション
export type ConcernType =
  | 'dryness'       // 乾燥
  | 'frizz'         // 広がり・うねり
  | 'split_ends'    // 枝毛・切れ毛
  | 'color_fade'    // 色落ち
  | 'thinning'      // 細毛・ボリューム
  | 'gray'          // 白髪
  | 'other';        // その他

// 当日の気分オプション
export type MoodType =
  | 'excited'       // ワクワク
  | 'relaxed'       // リラックス
  | 'normal'        // 普通
  | 'anxious';      // 少し不安

// アレルギー・苦手なものオプション
export type AllergyType =
  | 'hair_color'    // ヘアカラー成分
  | 'fragrance'     // 香り
  | 'detergent'     // 洗剤
  | 'none'          // なし
  | 'other';        // その他

// ========================================
// 3. 構造ヒント型
// ========================================

/**
 * 事前カウンセリング回答スキーマ（型ヒント）
 * answers フィールドの参考構造
 */
export interface PreCounselingAnswersHint {
  concerns?: ConcernType[];            // Q1: 髪のお悩み(複数選択)
  mood?: MoodType;                     // Q2: 当日の気分
  desired_look?: string;               // Q3: 仕上がりイメージ(自由入力)
  allergies?: AllergyType[];           // Q4: アレルギー・苦手(複数選択)
  stylist_request?: string;            // Q5: 美容師への要望(自由入力)
}

/**
 * AI 解析結果スキーマ（型ヒント）
 * ai_analysis フィールドの参考構造
 */
export interface AIAnalysisResultHint {
  summary?: string;                    // 顧客の意図要約(80 文字以内)
  suggested_menu?: string;             // 推奨メニュー
  preparation_notes?: string[];        // 準備事項(配列、3 項目以内)
  communication_tips?: string;         // 接客時の留意点
}

/**
 * 写真データ（型ヒント）
 * photos 配列要素の参考構造
 */
export interface PreCounselingPhotoHint {
  url?: string;                        // 画像 URL
  uploaded_at?: string;                // ISO 8601 timestamp
}

// ========================================
// 4. メインの PreCounseling 型
// ========================================

/**
 * 事前カウンセリング（pre_counselings テーブル）
 * 来店前に顧客が回答するアンケート・写真をまとめたレコード
 *
 * 設計: 柔軟性優先（JSONB フィールドは Record<string, any>）
 * 既存 Karte 型パターンに準拠
 */
export interface PreCounseling {
  id: string;                          // UUID
  customer_id: string;                 // UUID, NOT NULL
  salon_id: string;                    // UUID, NOT NULL
  reservation_id: string | null;       // UUID, NULLABLE（将来用）
  token: string;                       // TEXT, UNIQUE（LIFF アクセス用）
  sent_at: string | null;              // TIMESTAMPTZ, NULLABLE
  opened_at: string | null;            // TIMESTAMPTZ, NULLABLE
  submitted_at: string | null;         // TIMESTAMPTZ, NULLABLE
  answers: Record<string, any> | null; // JSONB, NULLABLE（構造ヒント: PreCounselingAnswersHint）
  photos: string[];                    // JSONB array, DEFAULT '[]'（URL 文字列の配列）
  ai_analysis: Record<string, any> | null; // JSONB, NULLABLE（構造ヒント: AIAnalysisResultHint）
  ai_analyzed_at: string | null;       // TIMESTAMPTZ, NULLABLE
  status: PreCounselingStatus;         // TEXT, DEFAULT 'pending'
  created_at: string;                  // TIMESTAMPTZ, DEFAULT now()
  updated_at: string;                  // TIMESTAMPTZ, DEFAULT now()
}

// ========================================
// 5. API リクエスト・レスポンス型
// ========================================

/**
 * POST /api/pre-counseling/create リクエスト
 * 事前カウンセリング作成時の入力スキーマ
 */
export interface CreatePreCounselingRequest {
  customer_id: string;
  salon_id: string;
  reservation_id?: string | null;
  scheduled_send_at?: string;          // ISO 8601、未指定なら即時送信
}

/**
 * POST /api/pre-counseling/create レスポンス
 */
export interface CreatePreCounselingResponse {
  pre_counseling_id: string;
  token: string;
  liff_url: string;
  status: PreCounselingStatus;
}

/**
 * GET /api/pre-counseling/[token] レスポンス
 * 顧客向け（顧客が LIFF で開くときに取得する情報）
 */
export interface GetPreCounselingResponse {
  pre_counseling_id: string;
  customer_name: string;               // マスク済み（姓のみ、またはイニシャル）
  salon_name: string;
  visit_date: string | null;           // ISO 8601 date
  status: PreCounselingStatus;
}

/**
 * POST /api/pre-counseling/[token]/submit リクエスト
 * 顧客がアンケート回答を送信するときのスキーマ
 */
export interface SubmitPreCounselingRequest {
  line_user_id?: string;               // LINE ユーザー ID（オプション）
  answers: Record<string, any>;        // アンケート回答（構造ヒント: PreCounselingAnswersHint）
  photos?: string[];                   // base64 文字列または URL の配列
}

/**
 * POST /api/pre-counseling/[token]/submit レスポンス
 */
export interface SubmitPreCounselingResponse {
  status: PreCounselingStatus;
  submitted_at: string;                // ISO 8601 timestamp
  ai_analysis_scheduled?: boolean;     // AI 解析がスケジュール済みか
}

// ========================================
// 6. エラー型
// ========================================

/**
 * 事前カウンセリング関連のエラーコード
 */
export type PreCounselingError =
  | 'INVALID_TOKEN'
  | 'EXPIRED_TOKEN'
  | 'NOT_FOUND'
  | 'ALREADY_SUBMITTED'
  | 'INVALID_INPUT'
  | 'UNAUTHORIZED'
  | 'INTERNAL_ERROR';

/**
 * エラーコードに対応するユーザー向けメッセージ
 * A4 ルール準拠: 警告表現は「注意」等で統一
 */
export const PRE_COUNSELING_ERROR_MESSAGES: Record<PreCounselingError, string> = {
  INVALID_TOKEN: 'リンクが無効です',
  EXPIRED_TOKEN: 'リンクの有効期限が切れています',
  NOT_FOUND: 'リンクが見つかりません',
  ALREADY_SUBMITTED: '既に回答済みです',
  INVALID_INPUT: '入力内容を確認してください',
  UNAUTHORIZED: '権限がありません',
  INTERNAL_ERROR: 'システムエラーが発生しました'
};
