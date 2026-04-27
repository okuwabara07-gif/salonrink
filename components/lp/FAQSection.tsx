'use client'
import { useState } from 'react'

export default function FAQSection() {
  const faqs = [
    { q: 'HPBのデータは失われませんか？', a: 'いいえ。SalonRinkはHPBのデータを読み込むだけで、HPB側のデータは一切変更しません。' },
    { q: '無料期間中に解約できますか？', a: 'はい。無料期間中いつでも解約できます。解約手数料は一切かかりません。' },
    { q: '既存顧客はどうなりますか？', a: 'ホットペッパーの既存顧客データを自動で読み込み。新規顧客はLINEで獲得できます。' },
    { q: 'サポートは受けられますか？', a: 'はい。メール・チャットで日本語サポートを提供しています。' },
    { q: 'アドオンの追加は簡単ですか？', a: 'ダッシュボードから1クリックで追加可能。即座に機能が有効になります。' },
    { q: 'スマートフォンで管理できますか？', a: 'はい。レスポンシブ対応で、スマートフォンでも全機能が利用できます。' },
  ]

  const [open, setOpen] = useState<number | null>(null)

  return (
    <section
      id="faq"
      style={{
        background: '#ffffff',
        padding: '80px 20px',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2
          style={{
            fontSize: 'clamp(28px, 6vw, 44px)',
            fontWeight: 700,
            color: 'var(--sr-blue-pale-deepest)',
            textAlign: 'center',
            marginBottom: '60px',
          }}
        >
          よくある質問
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ border: '1px solid var(--sr-border)', borderRadius: '12px', overflow: 'hidden' }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: 'var(--sr-bg-card)',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: 'var(--sr-blue-pale-deepest)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                {faq.q}
                <span style={{ transform: open === i ? 'rotate(180deg)' : '', transition: 'transform 0.3s' }}>
                  ▼
                </span>
              </button>
              {open === i && (
                <div style={{ padding: '16px 20px', background: 'var(--sr-bg)', color: 'var(--sr-text-soft)', borderTop: '1px solid var(--sr-border)' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
