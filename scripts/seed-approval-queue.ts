/**
 * seed-approval-queue.ts
 * E2E テスト用ダミーデータ生成
 *
 * Usage:
 *   npx ts-node scripts/seed-approval-queue.ts
 *
 * Creates:
 *   1. leads 1件 (source='test')
 *   2. approval_queue 3件 (pending)
 *      - sns_post (lint_status='pass')
 *      - nurture_msg (lint_status='flag')
 *      - outbound (lint_status='pass')
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}

const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  try {
    console.log('🌱 Seeding approval funnel test data...')

    // 1. leads 1件作成
    const { data: leadData, error: leadError } = await admin
      .from('leads')
      .insert({
        source: 'test',
        contact_name: 'テストユーザー',
        email: 'test@example.com',
        phone: '09012345678',
        salon_name: 'テストサロン',
        salon_size: '2-3人',
        cta_type: 'ai_experience',
        status: 'new',
      })
      .select('id')
      .single()

    if (leadError || !leadData) {
      console.error('❌ Failed to create lead:', leadError?.message)
      return
    }

    const leadId = leadData.id
    console.log(`✅ Created lead: ${leadId}`)

    // 2. approval_queue 3件作成
    const approvalQueue = [
      {
        lead_id: null,  // SNS投稿はリード紐付けなし
        kind: 'sns_post',
        payload: {
          sns_queue_id: 'placeholder-sns-id-1',
          site: 'kirei',
          platform: 'ig',
          caption: 'これは新作ネイルデザインです。素敵ですよね！',
          image_url: 'https://example.com/nail.jpg',
        },
        lint_status: 'pass',
        lint_notes: null,
      },
      {
        lead_id: leadId,
        kind: 'nurture_msg',
        payload: {
          nurture_queue_id: 'placeholder-nurture-id-1',
          channel: 'email',
          sequence_step: 1,
          message_data: {
            email: 'test@example.com',
            subject: 'SalonRink 14日間無料体験のご案内',
            html: '<p>ご興味ありがとうございます。</p>',
          },
        },
        lint_status: 'flag',
        lint_notes: '薬機法チェック: 医療表現が含まれているため確認が必要',
      },
      {
        lead_id: leadId,
        kind: 'outbound',
        payload: {
          outbound_type: 'slack_notify',
          message: '新規リードを受け取りました',
        },
        lint_status: 'pass',
        lint_notes: null,
      },
    ]

    for (const item of approvalQueue) {
      const { error } = await admin
        .from('approval_queue')
        .insert(item)

      if (error) {
        console.error(`❌ Failed to create approval_queue item:`, error.message)
        continue
      }

      console.log(`✅ Created approval_queue: ${item.kind}`)
    }

    console.log('\n🎉 Seeding complete!')
    console.log(`
Test data created:
- Lead ID: ${leadId}
- 3 approval_queue items (pending)

To test:
1. Visit /dashboard/approvals
2. Review the 3 pending items
3. Click "承認" or "却下" to test the approval flow
4. Check /api/approve logs
    `)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()
