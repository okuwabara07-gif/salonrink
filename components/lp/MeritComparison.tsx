export default function MeritComparison() {
  const merits = [
    {
      title: 'サロン側のメリット',
      items: [
        'HPB顧客をそのまま活用',
        'LINE自動配信で営業自動化',
        'リマインド通知で来店率UP',
        '顧客カルテで再来店施術提案',
      ],
    },
    {
      title: 'お客様側のメリット',
      items: [
        'LINEで簡単予約',
        'リマインド通知で忘れ防止',
        'クーポン・ポイント還元',
        '来店履歴から施術提案',
      ],
    },
  ]

  return (
    <section
      style={{
        background: 'linear-gradient(135deg, #b8d4e8 0%, #c8d4e0 100%)',
        padding: '80px 20px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2
          style={{
            fontSize: 'clamp(28px, 6vw, 44px)',
            fontWeight: 700,
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: '60px',
          }}
        >
          WIN-WINの関係を実現
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px',
          }}
        >
          {merits.map((merit, i) => (
            <div key={i}>
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#ffffff',
                  marginBottom: '24px',
                }}
              >
                {merit.title}
              </h3>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                }}
              >
                {merit.items.map((item, j) => (
                  <li
                    key={j}
                    style={{
                      padding: '12px 0',
                      paddingLeft: '28px',
                      color: '#ffffff',
                      fontSize: '15px',
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        color: 'var(--sr-yellow-cream)',
                        fontWeight: 700,
                      }}
                    >
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
