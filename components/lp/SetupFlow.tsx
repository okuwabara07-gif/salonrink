'use client'

import Image from 'next/image'

export default function SetupFlow() {
  const steps = [
    { num: '01', image: '/images/lp/setup-01.webp', title: 'お申し込み', desc: 'salonrink.com からお申し込み。最短当日にアカウント発行。' },
    { num: '02', image: '/images/lp/setup-02.webp', title: 'カスタマイズ', desc: 'メニュー・営業時間・スタッフ情報を登録。サロン専用にカスタマイズ。' },
    { num: '03', image: '/images/lp/setup-03.webp', title: 'テスト運用', desc: '実際に予約フローをテスト。問題ないことを確認。' },
    { num: '04', image: '/images/lp/setup-04.webp', title: '本格運用開始', desc: 'お客様への告知でスタート。サポートチームが伴走します。' },
  ]

  return (
    <section style={{ background: '#faf7f2', padding: '80px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2
          style={{
            fontSize: 'clamp(28px, 6vw, 44px)',
            fontWeight: 700,
            color: '#1a2c4f',
            textAlign: 'center',
            marginBottom: '16px',
          }}
        >
          導入の流れ
        </h2>
        <p
          style={{
            textAlign: 'center',
            color: '#5a6878',
            marginBottom: '60px',
            fontSize: '16px',
          }}
        >
          お申し込みから本格運用まで、最短1週間。
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
          }}
        >
          {steps.map((step) => (
            <div key={step.num} style={{ background: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ aspectRatio: '1/1', position: 'relative', overflow: 'hidden', background: '#f5f5f5' }}>
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  loading="lazy"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#d88896' }}>
                    {step.num}
                  </span>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a2c4f', margin: 0 }}>
                    {step.title}
                  </h3>
                </div>
                <p style={{ fontSize: '14px', color: '#5a6878', margin: 0, lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
