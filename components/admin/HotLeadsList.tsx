import { HotLead } from '@/lib/admin/dashboard-data'

interface HotLeadsListProps {
  leads: HotLead[]
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getScoreColor(score: number): string {
  if (score >= 90) return '#10B981'
  if (score >= 80) return '#3B82F6'
  if (score >= 70) return '#F59E0B'
  return '#6B7280'
}

export default function HotLeadsList({ leads }: HotLeadsListProps) {
  return (
    <div
      style={{
        background: '#1A1A1A',
        border: '1px solid #333',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        marginBottom: '40px',
        overflowX: 'auto',
      }}
    >
      <h3
        style={{
          fontSize: '18px',
          fontWeight: 700,
          color: '#fff',
          margin: '0 0 24px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        🔥 ホットリード一覧
        <span style={{ fontSize: '12px', color: '#999', fontWeight: 400 }}>
          (直近30日、スコア70+)
        </span>
      </h3>

      {leads.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#666',
            fontSize: '14px',
          }}
        >
          ホットリードがありません
        </div>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '2px solid #333' }}>
              <th
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  color: '#999',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: '12px',
                  letterSpacing: '0.5px',
                }}
              >
                名前
              </th>
              <th
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  color: '#999',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: '12px',
                  letterSpacing: '0.5px',
                }}
              >
                メール
              </th>
              <th
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  color: '#999',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: '12px',
                  letterSpacing: '0.5px',
                }}
              >
                サロン名
              </th>
              <th
                style={{
                  textAlign: 'center',
                  padding: '12px 16px',
                  color: '#999',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: '12px',
                  letterSpacing: '0.5px',
                }}
              >
                スコア
              </th>
              <th
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  color: '#999',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: '12px',
                  letterSpacing: '0.5px',
                }}
              >
                登録日
              </th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, idx) => (
              <tr
                key={lead.id}
                style={{
                  borderBottom: '1px solid #2a2a2a',
                  backgroundColor: idx % 2 === 0 ? 'transparent' : '#0f0f0f',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.backgroundColor = '#1f1f1f'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.backgroundColor = idx % 2 === 0 ? 'transparent' : '#0f0f0f'
                }}
              >
                <td style={{ padding: '12px 16px', color: '#fff' }}>
                  {lead.contact_name}
                </td>
                <td
                  style={{
                    padding: '12px 16px',
                    color: '#999',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                  }}
                >
                  {lead.email}
                </td>
                <td style={{ padding: '12px 16px', color: '#bbb' }}>
                  {lead.salon_name || '-'}
                </td>
                <td
                  style={{
                    padding: '12px 16px',
                    textAlign: 'center',
                    fontWeight: 600,
                    color: getScoreColor(lead.score),
                  }}
                >
                  {lead.score}
                </td>
                <td style={{ padding: '12px 16px', color: '#666', fontSize: '13px' }}>
                  {formatDate(lead.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div
        style={{
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #333',
          color: '#666',
          fontSize: '12px',
          textAlign: 'right',
        }}
      >
        合計: <strong style={{ color: '#C9A961' }}>{leads.length}</strong> 件
      </div>
    </div>
  )
}
