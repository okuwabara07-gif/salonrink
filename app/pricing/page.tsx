'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/lp/Header'
import Footer from '@/components/lp/Footer'

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const plans = [
    {
      name: 'Light',
      price: 1980,
      description: 'シンプルに始めたいサロン向け',
      features: [
        'AIカルテ基本機能',
        '顧客管理(最大100名)',
        '来店履歴記録',
        'LINE通知',
      ],
      badge: null,
    },
    {
      name: 'Standard',
      price: 2980,
      description: '売上を伸ばしたいサロン向け',
      features: [
        'AIカルテ全機能',
        'AIサマリー生成',
        'アレルギー警告',
        '顧客管理(無制限)',
        'HPB連携',
        '予約統計',
        '自動リマインド',
      ],
      badge: '人気No.1',
      isPopular: true,
    },
    {
      name: 'Premium',
      price: 4580,
      description: '本格的に運用したいサロン向け',
      features: [
        'すべてのStandard機能',
        '失客予測AI',
        '提案精度向上',
        'minimo連携',
        '優先サポート',
        'カスタマイズ相談',
      ],
      badge: null,
    },
  ]

  const addons = [
    {
      name: 'HPB連携',
      price: 1000,
      description: '予約・顧客情報を自動同期',
      icon: '🔗',
    },
    {
      name: 'minimo連携',
      price: 800,
      description: 'メッセージ・口コミ管理',
      icon: '💬',
    },
    {
      name: '高度AI機能',
      price: 800,
      description: '失客予測・提案精度向上',
      icon: '🤖',
    },
  ]

  const faqs = [
    {
      question: '無料期間終了後はどうなりますか?',
      answer:
        '無料期間終了後、選択されたプランの通常料金がお支払い開始となります。キャンセルをご希望の場合は、無料期間終了までに手続きをしていただければ、料金は発生いたしません。',
    },
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

  const displayPrice = (basePrice: number) => {
    if (isAnnual) {
      return Math.floor((basePrice * 12 * 10) / 12)
    }
    return basePrice
  }

  const annualSavings = (basePrice: number) => {
    return basePrice * 2
  }

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
            すべてのプランに30日間の無料期間が含まれます
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
          {/* 年額切替トグル */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'clamp(16px, 2vw, 24px)',
              marginBottom: 'clamp(60px, 8vw, 80px)',
            }}
          >
            <span
              style={{
                fontSize: 'clamp(0.95rem, 1.8vw, 1rem)',
                color: isAnnual ? 'var(--text-secondary)' : 'var(--text-primary)',
                fontWeight: isAnnual ? 400 : 600,
              }}
            >
              月額払い
            </span>

            <button
              onClick={() => setIsAnnual(!isAnnual)}
              style={{
                width: '60px',
                height: '32px',
                borderRadius: '16px',
                border: 'none',
                background: isAnnual ? 'var(--accent-gold)' : '#ccc',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.3s ease',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: '28px',
                  height: '28px',
                  borderRadius: '14px',
                  background: '#fff',
                  top: '2px',
                  left: isAnnual ? '30px' : '2px',
                  transition: 'left 0.3s ease',
                }}
              />
            </button>

            <span
              style={{
                fontSize: 'clamp(0.95rem, 1.8vw, 1rem)',
                color: isAnnual ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isAnnual ? 600 : 400,
              }}
            >
              年額払い
            </span>

            {isAnnual && (
              <span
                style={{
                  background: 'var(--accent-gold)',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                  fontWeight: 600,
                  marginLeft: '8px',
                }}
              >
                2ヶ月無料
              </span>
            )}
          </div>

          {/* プランカード */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'clamp(24px, 3vw, 32px)',
              marginBottom: 'clamp(80px, 12vw, 120px)',
            }}
          >
            {plans.map((plan) => (
              <div
                key={plan.name}
                style={{
                  background: '#fff',
                  border: plan.isPopular ? '2px solid var(--accent-gold)' : '1px solid var(--sr-border)',
                  borderRadius: 16,
                  padding: 'clamp(32px, 5vw, 40px)',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.12)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* 人気No.1バッジ */}
                {plan.badge && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'var(--accent-gold)',
                      color: '#fff',
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                      fontWeight: 600,
                    }}
                  >
                    {plan.badge}
                  </div>
                )}

                {/* プラン名 */}
                <h3
                  style={{
                    fontFamily: 'var(--font-noto-sans-jp)',
                    fontSize: 'clamp(1.5rem, 3vw, 1.75rem)',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginTop: 0,
                    marginBottom: 'clamp(8px, 1.5vw, 12px)',
                  }}
                >
                  {plan.name}
                </h3>

                {/* 説明 */}
                <p
                  style={{
                    fontFamily: 'var(--font-noto-sans-jp)',
                    fontSize: 'clamp(0.8rem, 1.4vw, 0.875rem)',
                    color: 'var(--text-secondary)',
                    margin: '0 0 clamp(20px, 3vw, 24px) 0',
                  }}
                >
                  {plan.description}
                </p>

                {/* 価格 */}
                <div
                  style={{
                    marginBottom: 'clamp(24px, 3vw, 32px)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}
                  >
                    ¥{displayPrice(plan.price).toLocaleString()}
                  </div>
                  <div
                    style={{
                      fontSize: 'clamp(0.8rem, 1.4vw, 0.875rem)',
                      color: 'var(--text-secondary)',
                      marginTop: '4px',
                    }}
                  >
                    {isAnnual ? '/ 年額' : '/ 月額'}
                    {isAnnual && (
                      <div style={{ marginTop: '8px', color: 'var(--accent-gold)', fontWeight: 600 }}>
                        年額¥{(displayPrice(plan.price) * 12).toLocaleString()} (¥{annualSavings(plan.price).toLocaleString()}お得)
                      </div>
                    )}
                  </div>
                </div>

                {/* 機能リスト */}
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '0 0 clamp(24px, 3vw, 32px) 0',
                  }}
                >
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      style={{
                        fontFamily: 'var(--font-noto-sans-jp)',
                        fontSize: 'clamp(0.85rem, 1.6vw, 0.9375rem)',
                        color: 'var(--text-secondary)',
                        padding: 'clamp(8px, 1vw, 10px) 0',
                        borderBottom: i < plan.features.length - 1 ? '1px solid var(--sr-border)' : 'none',
                        paddingLeft: '24px',
                        position: 'relative',
                      }}
                    >
                      <span style={{ position: 'absolute', left: 0 }}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTAボタン */}
                <Link
                  href="/register"
                  style={{
                    display: 'block',
                    width: '100%',
                    background: plan.isPopular ? 'var(--accent-gold)' : '#1A1018',
                    color: '#fff',
                    padding: 'clamp(12px, 2vw, 16px)',
                    borderRadius: 8,
                    fontFamily: 'var(--font-noto-sans-jp)',
                    fontSize: 'clamp(0.95rem, 1.5vw, 1rem)',
                    fontWeight: 500,
                    textDecoration: 'none',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  無料で試す
                </Link>
              </div>
            ))}
          </div>

          {/* アドオンセクション */}
          <div
            style={{
              marginBottom: 'clamp(80px, 12vw, 120px)',
            }}
          >
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
              オプション機能
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'clamp(20px, 3vw, 32px)',
              }}
            >
              {addons.map((addon) => (
                <div
                  key={addon.name}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--sr-border)',
                    borderRadius: 12,
                    padding: 'clamp(20px, 3vw, 24px)',
                    display: 'flex',
                    gap: 'clamp(12px, 2vw, 16px)',
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ fontSize: '2rem' }}>{addon.icon}</div>
                  <div style={{ flex: 1 }}>
                    <h4
                      style={{
                        fontFamily: 'var(--font-noto-sans-jp)',
                        fontSize: 'clamp(0.95rem, 1.8vw, 1rem)',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        margin: '0 0 4px 0',
                      }}
                    >
                      {addon.name}
                    </h4>
                    <p
                      style={{
                        fontFamily: 'var(--font-noto-sans-jp)',
                        fontSize: 'clamp(0.8rem, 1.4vw, 0.875rem)',
                        color: 'var(--text-secondary)',
                        margin: 0,
                      }}
                    >
                      {addon.description}
                    </p>
                  </div>
                  <div
                    style={{
                      fontSize: 'clamp(1rem, 1.8vw, 1.125rem)',
                      fontWeight: 600,
                      color: 'var(--accent-gold)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    +¥{addon.price.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
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
