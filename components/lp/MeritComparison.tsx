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
    <section className="relative py-20 px-4 overflow-hidden">
      {/* 背景画像 */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/lp/winwin-bg.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* コンテンツ（前面） */}
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <h2
          style={{
            fontSize: 'clamp(28px, 6vw, 44px)',
            fontWeight: 700,
            marginBottom: '48px',
          }}
        >
          <span
            style={{
              background: 'linear-gradient(transparent 60%, #FEF08A 60%)',
              padding: '0 8px',
              display: 'inline',
            }}
          >
            WIN-WINの関係を実現
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {/* サロン側のメリット */}
          <div>
            <h3
              style={{
                fontSize: '20px',
                fontWeight: 700,
                marginBottom: '24px',
                color: '#1a2c4f',
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
                    fontSize: '15px',
                    position: 'relative',
                    color: '#1a2c4f',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      fontWeight: 700,
                      color: '#d88896',
                    }}
                  >
                    ✓
                  </span>
                  <span
                    style={{
                      background: 'linear-gradient(transparent 60%, #FEF08A 60%)',
                      padding: '0 4px',
                      fontWeight: '600',
                      display: 'inline',
                    }}
                  >
                    {item}
                  </span>
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
                marginBottom: '24px',
                color: '#1a2c4f',
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
                    fontSize: '15px',
                    position: 'relative',
                    color: '#1a2c4f',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      fontWeight: 700,
                      color: '#d88896',
                    }}
                  >
                    ✓
                  </span>
                  <span
                    style={{
                      background: 'linear-gradient(transparent 60%, #FEF08A 60%)',
                      padding: '0 4px',
                      fontWeight: '600',
                      display: 'inline',
                    }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
