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
    { q: 'AI機能とは何ですか？', a: 'SalonRinkのAI機能は、Claude Haikuを活用した美容師の頭脳を支える機能群です。AIカルテ（顧客サマリー自動生成）、AI接客スクリプト、AIアレルギー警告、AI次回提案の4つの機能で、お客様一人ひとりに最適な施術提案をサポートします。' },
    { q: 'お客様の個人情報・プライバシーは大丈夫ですか？', a: 'SalonRinkはSupabaseのRow Level Security（RLS）により、サロンごとにデータを完全分離しています。他サロンの顧客情報にアクセスすることは技術的に不可能です。AIへの送信時もサロンIDで認証され、お客様の個人情報は暗号化して保存されています。' },
    { q: 'Claude Haikuとは何ですか？', a: 'Claude HaikuはAnthropic社が開発した最新のAIモデルです。美容業界向けに調整したプロンプトで、日本語の繊細なニュアンスや美容用語（髪質・カラー名・薬剤情報）を理解できるよう設計されています。高速・低コストで、サロンの月額負担を最小化しながら高品質なサービスを提供できます。' },
    { q: 'AIが間違った提案をしたらどうなりますか？', a: 'AIは美容師の判断を補助するツールです。すべてのAI出力は美容師が編集・確認できます。最終判断は美容師に委ねられており、AIを「絶対視」する必要はありません。むしろ、AIの提案が美容師の経験と合致すれば自信に、合致しなければ「もう一度確認しよう」のきっかけになります。' },
    { q: 'AI機能の追加料金はかかりますか？', a: 'Coreプラン（¥1,980/月）にAI機能（顧客サマリー・基本接客スクリプト・アレルギー警告）が標準装備されています。さらに高度なAI機能（より精緻な分析・カスタムプロンプト）をご希望の場合は、AI ADD（+¥800/月）で拡張可能です。' },
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
