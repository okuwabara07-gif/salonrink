'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/lp/Header'
import Footer from '@/components/lp/Footer'

export default function PricingPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const plans = [
    {
      name: 'PASS',
      price: '0円',
      unit: '',
      features: [
        'LINE会員証',
        'ポイント・ポイント履歴',
        '来店前メモ',
        '髪の記録',
        '当日の来店一覧',
        'HPB予約リンク',
        '店頭POP',
      ],
      isBase: true,
    },
    {
      name: '自動化',
      price: '1,500円',
      unit: '/ 月',
      features: [
        'SALON BOARD連携',
        '会計から自動でポイント付与',
        '当日一覧に金額',
        '薬剤メモの引き継ぎ',
      ],
    },
    {
      name: '通知',
      price: '800円',
      unit: '/ 月',
      features: [
        '前日のリマインド',
        '次回予約の案内',
        '来店周期のお知らせ',
        '※配信実費はサロンのLINE公式',
      ],
    },
    {
      name: 'AI',
      price: '800円',
      unit: '/ 月',
      features: [
        '写真診断の高度解析',
        '提案文の自動生成',
        '※客向けの深掘りは1回¥110',
      ],
    },
    {
      name: '導入支援',
      price: '8,000円',
      unit: '初期（任意）',
      features: [
        '紙カードからの移行',
        'POP作成',
        'スタッフ説明',
      ],
    },
  ]

  const faqs = [
    {
      question: 'データの移行はできますか?',
      answer:
        '他のシステムからのデータ移行をサポートいたします。詳細はサポートチームまでお問い合わせください。',
    },
    {
      question: '解約はいつでもできますか?',
      answer:
        'はい、いつでも解約可能です。長期契約の縛りはございません。解約手続きはダッシュボードから簡単に行えます。',
    },
  ]

  return (
    <main style={{ background: 'var(--bg-main)' }}>
      <Header />

      {/* ページタイトル */}
      <section
        style={{
          background: 'var(--bg-card)',
          padding: 'clamp(80px, 12vw, 120px) clamp(20px, 5vw, 60px)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1
            style={{
              fontFamily: 'var(--font-noto-serif-jp)',
              fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
              fontWeight: 400,
              color: 'var(--text-primary)',
              textAlign: 'center',
              marginTop: 0,
              marginBottom: 'clamp(12px, 2vw, 16px)',
              letterSpacing: 0.02,
            }}
          >
            料金プラン
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-noto-sans-jp)',
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              fontWeight: 300,
              color: 'var(--text-secondary)',
              textAlign: 'center',
              marginTop: 0,
              marginBottom: 0,
            }}
          >
            会員証とポイントは0円。自動化・通知・AIは、必要なものだけ追加できます
          </p>
        </div>
      </section>

      {/* プランセクション */}
      <section
        style={{
          background: 'var(--bg-main)',
          padding: 'clamp(80px, 12vw, 120px) clamp(20px, 5vw, 60px)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* プランカード */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'clamp(16px, 2vw, 24px)',
              marginBottom: 'clamp(24px, 3vw, 32px)',
            }}
          >
            {plans.map((plan) => (
              <div
                key={plan.name}
                style={{
                  background: '#fff',
                  border: plan.isBase ? '2px solid var(--accent-gold)' : '1px solid var(--sr-border)',
                  borderRadius: 16,
                  padding: 'clamp(24px, 4vw, 32px)',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-noto-sans-jp)',
                    fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginTop: 0,
                    marginBottom: 'clamp(12px, 2vw, 16px)',
                  }}
                >
                  {plan.name}
                </h3>

                <div style={{ marginBottom: 'clamp(20px, 3vw, 24px)' }}>
                  <span
                    style={{
                      fontSize: plan.isBase ? 'clamp(2.25rem, 4.5vw, 2.75rem)' : 'clamp(1.75rem, 3.5vw, 2rem)',
                      fontWeight: 600,
                      color: plan.isBase ? 'var(--accent-gold)' : 'var(--text-primary)',
                    }}
                  >
                    {plan.price}
                  </span>
                  {plan.unit && (
                    <span
                      style={{
                        fontSize: 'clamp(0.8rem, 1.4vw, 0.875rem)',
                        color: 'var(--text-secondary)',
                        marginLeft: '6px',
                      }}
                    >
                      {plan.unit}
                    </span>
                  )}
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      style={{
                        fontFamily: 'var(--font-noto-sans-jp)',
                        fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)',
                        color: 'var(--text-secondary)',
                        padding: '8px 0',
                        borderBottom: i < plan.features.length - 1 ? '1px solid var(--sr-border)' : 'none',
                        paddingLeft: feature.startsWith('※') ? 0 : '20px',
                        position: 'relative',
                      }}
                    >
                      {!feature.startsWith('※') && <span style={{ position: 'absolute', left: 0 }}>✓</span>}
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* 注記 */}
          <p
            style={{
              fontFamily: 'var(--font-noto-sans-jp)',
              fontSize: 'clamp(0.8rem, 1.4vw, 0.875rem)',
              color: 'var(--text-secondary)',
              textAlign: 'center',
              lineHeight: 1.8,
              margin: '0 0 clamp(32px, 5vw, 40px) 0',
            }}
          >
            初期費用0円。いつでも解約可。価格はすべて税込。
            <br />
            旧プラン（Light/Standard/Premium）は既存契約のみ継続します。
          </p>

          <div style={{ textAlign: 'center', marginBottom: 'clamp(80px, 12vw, 120px)' }}>
            <Link
              href="/register"
              style={{
                display: 'inline-block',
                background: 'var(--accent-gold)',
                color: '#fff',
                padding: 'clamp(12px, 2vw, 16px) clamp(32px, 5vw, 48px)',
                borderRadius: 8,
                fontFamily: 'var(--font-noto-sans-jp)',
                fontSize: 'clamp(0.95rem, 1.5vw, 1rem)',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              無料で始める
            </Link>
          </div>

          {/* FAQセクション */}
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-noto-serif-jp)',
                fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
                fontWeight: 400,
                color: 'var(--text-primary)',
                textAlign: 'center',
                marginBottom: 'clamp(40px, 6vw, 60px)',
                letterSpacing: 0.02,
              }}
            >
              よくある質問
            </h2>

            <div
              style={{
                maxWidth: '800px',
                margin: '0 auto',
              }}
            >
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  style={{
                    borderBottom: '1px solid var(--sr-border)',
                    marginBottom: 'clamp(16px, 2vw, 20px)',
                  }}
                >
                  <button
                    onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      padding: 'clamp(16px, 2vw, 20px) 0',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.7'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1'
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-noto-sans-jp)',
                        fontSize: 'clamp(0.95rem, 1.8vw, 1rem)',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {faq.question}
                    </span>
                    <span
                      style={{
                        fontSize: '1.25rem',
                        color: 'var(--text-secondary)',
                        transition: 'transform 0.3s ease',
                        transform: openFAQ === i ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    >
                      ▼
                    </span>
                  </button>

                  {openFAQ === i && (
                    <div
                      style={{
                        paddingBottom: 'clamp(16px, 2vw, 20px)',
                        fontFamily: 'var(--font-noto-sans-jp)',
                        fontSize: 'clamp(0.85rem, 1.6vw, 0.9375rem)',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                      }}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
