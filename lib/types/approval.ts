// Approval Funnel Types
// Note: funnel_leads / funnel_lead_events テーブルから読み書き
//       既存CRM leads / lead_events / lp_leads とは別物

export interface Lead {
  id: string
  source: 'lp' | 'direct' | 'line' | 'import' | string
  line_user_id?: string | null
  contact_name: string
  email: string
  phone?: string | null
  salon_name?: string | null
  salon_size?: string | null
  cta_type: string
  ai_experience_result?: Record<string, unknown> | null
  status: 'new' | 'approved' | 'rejected' | 'archived'
  created_at: string
  updated_at: string
}

export interface LeadEvent {
  id: string
  lead_id: string
  event_type: string
  metadata?: Record<string, unknown> | null
  created_at: string
}

export interface Carte {
  id: string
  lead_id: string
  content: Record<string, unknown>
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  approved_at?: string | null
  approved_by?: string | null
}

export type ApprovalQueueKind = 'sns_post' | 'nurture_msg' | 'outbound' | 'product_push'
export type LintStatus = 'pass' | 'flag'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface ApprovalQueue {
  id: string
  lead_id?: string | null
  kind: ApprovalQueueKind
  payload: Record<string, unknown>
  lint_status: LintStatus
  lint_notes?: string | null
  status: ApprovalStatus
  decision_by?: string | null
  decision_at?: string | null
  created_at: string
}

export type NurtureChannel = 'email' | 'sms' | 'line'
export type NurtureStatus = 'pending' | 'sent' | 'failed'

export interface NurtureQueue {
  id: string
  lead_id: string
  channel: NurtureChannel
  sequence_step?: number | null
  message_template?: Record<string, unknown> | null
  status: NurtureStatus
  scheduled_at?: string | null
  sent_at?: string | null
  created_at: string
}

export type SnsQueueSite = 'kirei' | 'soccer' | 'salonrink'
export type SnsQueuePlatform = 'ig' | 'x' | 'tiktok' | 'yt'
export type SnsQueueStatus = 'pending' | 'scheduled' | 'published' | 'failed'

export interface SnsQueue {
  id: string
  lead_id?: string | null
  site: SnsQueueSite
  platform: SnsQueuePlatform
  topic?: string | null
  caption?: string | null
  image_url?: string | null
  lint_status: LintStatus
  lint_notes?: string | null
  status: SnsQueueStatus
  scheduled_at?: string | null
  published_at?: string | null
  approved_by?: string | null
  approved_at?: string | null
  created_at: string
}

// Request/Response Types

export interface ApproveRequestBody {
  id: string
  decision: 'approved' | 'rejected'
  lint_notes?: string
}

export interface ApproveResponse {
  success: boolean
  decision_at: string
  executed_count: number
  error?: string
}
