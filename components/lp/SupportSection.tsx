'use client'

import Image from 'next/image'

export default function SupportSection() {
  return (
    <section style={{ background: '#ffffff', padding: '80px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
          {/* 左: 画像 */}
          <div style={{ borderRadius: '16px', overflow: 'hidden', order: 1 }}>
            <Image
              src="/images/lp/feature-11-support.webp"
              alt="SalonRinkサポート体制"
              width={600}
              height={600}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>

          {/* 右: テキスト */}
          <div style={{ order: 2 }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#d88896', marginBottom: '12px' }}>
              SUPPORT
            </p>
            <h2
              style={{
                fontSize: 'clamp(24px, 5vw, 36px)',
                fontWeight: 700,
                color: '#1a2c4f',
                marginBottom: '24px',
                lineHeight: 1.4,
              }}
            >
              一人で悩まない、<br />伴走サポート
            </h2>
            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.8,
                color: '#5a6878',
                marginBottom: '32px',
              }}
            >
              SalonRinkは導入して終わりではありません。フリーランスから始めるサロン経営を、
              専任のサポートチームが支えます。
            </p>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '16px',
              }}
            >
              <li style={{ fontSize: '15px', color: '#5a6878', lineHeight: 1.6 }}>
                ・導入時の初期設定代行(オプション)
              </li>
              <li style={{ fontSize: '15px', color: '#5a6878', lineHeight: 1.6 }}>
                ・LINE/メールでの随時サポート
              </li>
              <li style={{ fontSize: '15px', color: '#5a6878', lineHeight: 1.6 }}>
                ・運用ノウハウの定期配信
              </li>
              <li style={{ fontSize: '15px', color: '#5a6878', lineHeight: 1.6 }}>
                ・操作不明点への24時間以内回答
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* モバイル対応 */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-cols-2"] {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          div[style*="order: 1"] {
            order: 2 !important;
          }
          div[style*="order: 2"] {
            order: 1 !important;
          }
        }
      `}</style>
    </section>
  )
}
