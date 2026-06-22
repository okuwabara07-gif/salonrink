/**
 * Agent Automation Types
 * SDR営業アウトバウンド・オーナー承認制フロー
 *
 * 実テーブルスキーマに準拠:
 * - salon_prospects
 * - agents_config
 * - agent_actions
 */

/* ── salon_prospects ────────────────────────────────── */
export type SalonProspectStatus = 'new' | 'drafted' | 'queued' | 'approved' | 'sent' | 'replied' | 'rejected' | 'bounced'

export interface SalonProspect {
  id: string // uuid
  salon_name: string
  contact_name: string
  email: string
  region: string
  url: string
  source: string
  status: SalonProspectStatus
  opted_out: boolean
  notes: string | null
  last_outreach_at: string | null // timestamptz
  created_at: string // timestamptz
  updated_at: string // timestamptz
}

/* ── agents_config ─────────────────────────────────── */
export interface AgentConfig {
  agent: string // e.g., 'sdr'
  tenant_id: string // e.g., 'salonrink'
  enabled: boolean
  schedule_cron: string
  daily_cap: number
  notes: string | null
  updated_at: string // timestamptz
}

/* ── agent_actions ─────────────────────────────────── */
export type AgentActionType = 'outbound_email' | 'outbound_sms' | 'follow_up' | 'proposal'
export type AgentActionStatus = 'pending' | 'approved' | 'rejected' | 'executed' | 'failed'

export interface AgentAction {
  id: string // uuid
  tenant_id: string
  salon_id: string // uuid (foreign key to salon_prospects.id)
  agent: string // e.g., 'sdr'
  tier: string // e.g., 'draft', 'approval', ...
  type: AgentActionType
  title: string // Email subject preview
  payload: Record<string, unknown> // jsonb
  status: AgentActionStatus
  result: Record<string, unknown> | null // jsonb
  expires_at: string // timestamptz
  created_at: string // timestamptz
  decided_at: string | null // timestamptz
  executed_at: string | null // timestamptz
}

/* ── Helper Types ──────────────────────────────────── */

/**
 * ドラフト生成用リクエスト
 */
export interface SdrDraftRequest {
  prospect: SalonProspect
}

/**
 * ドラフト生成レスポンス
 */
export interface SdrDraftResponse {
  subject: string
  html: string
}

/**
 * SDR cron ドラフト結果
 */
export interface SdrDraftResult {
  success: boolean
  drafted: number
  inserted: number
  errors?: string[]
  error?: string
}

/**
 * Payload schema for outbound_email
 */
export interface OutboundEmailPayload {
  prospect_id: string // uuid
  email: string
  salon_name: string
  contact_name: string
  subject: string
  html: string
  expires_at: string // ISO timestamp
}
