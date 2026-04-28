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
    <section className="bg-gradient-to-b from-blue-100 to-blue-50 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr_280px] gap-8 items-end">
          {/* 左：男性画像 */}
          <div className="hidden md:block">
            <Image
              src="/images/lp/winwin-salon-male.jpg"
              alt="美容師（サロン側）"
              width={280}
              height={400}
              className="w-full h-auto object-cover rounded-lg shadow-lg"
              priority
            />
          </div>

          {/* 中央：見出し + メリット */}
          <div>
            <h2
              style={{
                fontSize: 'clamp(28px, 6vw, 44px)',
                fontWeight: 700,
                color: '#ffffff',
                textAlign: 'center',
                marginBottom: '48px',
              }}
            >
              WIN-WINの関係を実現
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* サロン側のメリット */}
              <div>
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#ffffff',
                    marginBottom: '24px',
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

              {/* お客様側のメリット */}
              <div>
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#ffffff',
                    marginBottom: '24px',
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

          {/* 右：女性画像 */}
          <div className="hidden md:block">
            <Image
              src="/images/lp/winwin-customer-female.jpg"
              alt="お客様"
              width={280}
              height={400}
              className="w-full h-auto object-cover rounded-lg shadow-lg"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
