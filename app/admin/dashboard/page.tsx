/**
 * Admin Dashboard - Sales 管理画面
 * URL: /admin/dashboard
 *
 * 認証: Supabase Auth + ADMIN_EMAILS ホワイトリスト (app/admin/layout.tsx で実施)
 *
 * 表示内容:
 * - 今日のアクティビティサマリー(4つのカード)
 * - ホットリード一覧(直近30日、スコア70+)
 * - スコア分布グラフ(A/B/C/D 構成比)
 */

import { getTodayActivity, getHotLeads, getScoreDistribution } from '@/lib/admin/dashboard-data'
import TodayActivitySummary from '@/components/admin/TodayActivitySummary'
import HotLeadsList from '@/components/admin/HotLeadsList'
import ScoreDistributionChart from '@/components/admin/ScoreDistributionChart'

export const revalidate = 0

export default async function AdminDashboardPage() {
  // データ並列取得
  const [activityData, hotLeads, distributionData] = await Promise.all([
    getTodayActivity(),
    getHotLeads(30),
    getScoreDistribution(),
  ])

  return (
    <main
      style={{
        background: '#0a0a0a',
        minHeight: '100vh',
        color: '#fff',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {/* ヘッダー */}
        <div style={{ marginBottom: '40px' }}>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 700,
              margin: '0 0 8px 0',
              color: '#fff',
            }}
          >
            🎯 Admin Dashboard
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: '#999',
              margin: 0,
            }}
          >
            リアルタイム Sales 活動分析
          </p>
        </div>

        {/* 今日のアクティビティ */}
        <TodayActivitySummary data={activityData} />

        {/* ホットリード一覧とスコア分布 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '40px',
          }}
        >
          <HotLeadsList leads={hotLeads} />
          <ScoreDistributionChart data={distributionData} />
        </div>

        {/* フッター */}
        <div
          style={{
            marginTop: '60px',
            paddingTop: '20px',
            borderTop: '1px solid #333',
            color: '#666',
            fontSize: '12px',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: '0 0 8px 0' }}>
            データは自動更新されます。後続機能: Cron 実行状況、API コスト、売上進捗
          </p>
          <p style={{ margin: 0 }}>
            最終更新:{' '}
            <code style={{ background: '#1a1a1a', padding: '2px 6px', borderRadius: '2px' }}>
              {new Date().toLocaleString('ja-JP')}
            </code>
          </p>
        </div>
      </div>
    </main>
  )
}
