import { TodayActivity } from '@/lib/admin/dashboard-data'

interface TodayActivitySummaryProps {
  data: TodayActivity
}

export default function TodayActivitySummary({ data }: TodayActivitySummaryProps) {
  const cards = [
    {
      label: '新規リード',
      value: data.newLeads,
      color: '#4A90E2',
      icon: '📝',
    },
    {
      label: 'ホットリード',
      value: data.hotLeads,
      color: '#E84C3D',
      icon: '🔥',
    },
    {
      label: 'メール送信',
      value: data.emailsSent,
      color: '#7B68EE',
      icon: '📧',
    },
    {
      label: 'ブログ記事',
      value: data.blogArticles,
      color: '#C9A961',
      icon: '📚',
    },
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '40px',
      }}
    >
      {cards.map((card) => (
        <div
          key={card.label}
          style={{
            background: '#1A1A1A',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = 'translateY(-4px)'
            el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = 'translateY(0)'
            el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px',
            }}
          >
            <label
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#999',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: 0,
              }}
            >
              {card.label}
            </label>
            <span style={{ fontSize: '24px' }}>{card.icon}</span>
          </div>

          <div
            style={{
              fontSize: '44px',
              fontWeight: 700,
              color: card.color,
              lineHeight: 1,
              marginBottom: '8px',
            }}
          >
            {card.value}
          </div>

          <div
            style={{
              height: '4px',
              background: `linear-gradient(90deg, ${card.color} 0%, ${card.color}33 100%)`,
              borderRadius: '2px',
              marginTop: '12px',
            }}
          />
        </div>
      ))}
    </div>
  )
}
