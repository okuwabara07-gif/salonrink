'use client'

import Image from 'next/image'

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
          {/* サロン側のメリット カラム */}
          <div>
            {/* 画像 */}
            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-white/30 ring-4 ring-white/50 shadow-lg">
                <Image
                  src="/images/lp/winwin-salon-male.jpg"
                  alt="美容師（サロン側）"
                  fill
                  className="object-cover"
                  style={{ objectPosition: "center 30%" }}
                />
              </div>
            </div>

            <h3
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '24px',
                textAlign: 'center',
              }}
            >
              {merits[0].title}
            </h3>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
              }}
            >
              {merits[0].items.map((item, j) => (
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

          {/* お客様側のメリット カラム */}
          <div>
            {/* 画像 */}
            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-white/30 ring-4 ring-white/50 shadow-lg">
                <Image
                  src="/images/lp/winwin-customer-female.jpg"
                  alt="お客様"
                  fill
                  className="object-cover"
                  style={{ objectPosition: "center 20%" }}
                />
              </div>
            </div>

            <h3
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '24px',
                textAlign: 'center',
              }}
            >
              {merits[1].title}
            </h3>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
              }}
            >
              {merits[1].items.map((item, j) => (
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
        </div>
      </div>
    </section>
  )
}
