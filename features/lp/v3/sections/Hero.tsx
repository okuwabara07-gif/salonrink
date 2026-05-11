'use client';

import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';

type Props = {
  onCta?: () => void;
};

export default function Hero({ onCta }: Props) {
  return (
    <>
      <section
        id="top"
        style={{
          position: 'relative',
          backgroundColor: 'var(--c-bg)',
          paddingLeft: 0,
          paddingRight: 0,
          paddingTop: 0,
          paddingBottom: 0,
          overflow: 'hidden',
        }}
      >
        {/* 写真背景層（全幅ブリード） */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '70%',
            height: '100%',
            zIndex: 0,
          }}
        >
          <img
            src="/v3/hero-main.png"
            alt="美容師がタブレットを使って顧客とカウンセリングしている様子"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center center',
              display: 'block',
            }}
          />
          {/* 左端強めグラデーション */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '50%',
              height: '100%',
              background: 'linear-gradient(to right, var(--c-bg) 0%, var(--c-bg) 30%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />
          {/* 全体白オーバーレイ（淡化） */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255, 255, 255, 0.3)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* 2カラム split layout */}
        <div className="container hero-grid" style={{ position: 'relative', zIndex: 1 }}>
          {/* ───────── 左: text column ───────── */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <FadeUp>
              {/* Eyebrow */}
              <p style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.32em',
                color: 'var(--c-accent)',
                marginBottom: 28,
                marginTop: 0,
              }}>
                <span style={{ width: 32, height: '1px', backgroundColor: 'var(--c-accent)' }} />
                A I &nbsp;×&nbsp; C A R T E &nbsp;×&nbsp; L I N E
              </p>

              {/* Headline */}
              <h1 style={{
                fontFamily: 'var(--f-display)',
                fontSize: '40px',
                lineHeight: 1.45,
                letterSpacing: '0.02em',
                color: 'var(--c-fg)',
                marginTop: 0,
                marginBottom: 28,
              }}>
                <span style={{ display: 'block' }}>
                  ちゃんと、<MarkGold>向き合える</MarkGold>。
                </span>
                <span style={{ display: 'block', marginTop: 8 }}>
                  その<MarkGold>カウンセリング</MarkGold>、
                </span>
                <span style={{ display: 'block', marginTop: 8 }}>
                  <span style={{ color: 'var(--c-accent)' }}>AI</span>がそっと支えます。
                </span>
              </h1>

              {/* Sub copy */}
              <p style={{
                fontFamily: 'var(--f-body)',
                fontSize: '15px',
                lineHeight: 1.6,
                color: 'var(--c-fg-2)',
                marginTop: 0,
                marginBottom: 28,
              }}>
                LINEで完結するAIカルテで、サロンワークをもっと安心・スマートに。
              </p>

              {/* Trust chips */}
              <ul style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
                marginTop: 28,
                marginBottom: 0,
                paddingLeft: 0,
                listStyle: 'none',
              }}>
                {['初期費用 ¥3,000(SNS共有で無料)', '最短契約期間 なし', 'LINEだけでスタート'].map((label) => (
                  <li
                    key={label}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      borderRadius: '9999px',
                      backgroundColor: 'var(--c-fg)',
                      paddingLeft: 12,
                      paddingRight: 16,
                      paddingTop: 8,
                      paddingBottom: 8,
                      fontSize: 12,
                      color: 'var(--c-bg)',
                    }}
                  >
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: 'var(--c-accent)',
                      fontSize: 11,
                      fontWeight: 'bold',
                      color: 'var(--c-bg)',
                      flexShrink: 0,
                    }}>✓</span>
                    {label}
                  </li>
                ))}
              </ul>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: 10, marginTop: 28, flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={onCta}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span className="btn-line-icon">L</span> LINEでデモを見る <Icon name="arrowRight" size={14} />
                </button>
                <button className="btn btn-ghost btn-lg">
                  14日間無料で試す
                </button>
              </div>

              {/* Caption */}
              <p style={{ marginTop: 12, fontSize: 12, color: 'var(--c-fg-3)', marginBottom: 0 }}>
                約 5分でセットアップ。導入サポート
              </p>
            </FadeUp>
          </div>

          {/* ───────── 右: phone overlay のみ ───────── */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <FadeUp delay={120}>
              {/* Phone overlay: responsive via .hero-phone class */}
              <PhoneOverlay />
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ─────────── announcement bar ─────────── */}
      <div style={{
        backgroundColor: 'var(--c-fg)',
        paddingTop: 12,
        paddingBottom: 12,
        textAlign: 'center',
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.9)',
        letterSpacing: '0.04em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}>
        <span style={{
          display: 'inline-block',
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: '#06C755',
        }} />
        現在
        <span style={{
          marginLeft: 8,
          marginRight: 8,
          borderRadius: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          paddingLeft: 8,
          paddingRight: 8,
          paddingTop: 4,
          paddingBottom: 4,
        }}>ベータ版</span>
        として運用中・先着サロン募集
      </div>
    </>
  );
}

/* ─────────── helpers ─────────── */

function MarkGold({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        backgroundImage: 'linear-gradient(transparent 70%, var(--c-accent) 70%)',
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {children}
    </span>
  );
}

function PhoneOverlay() {
  return (
    <div className="hero-phone">
      {/* 上タブ */}
      <div style={{
        marginBottom: 12,
        marginLeft: 24,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        borderRadius: '9999px',
        backgroundColor: 'var(--c-fg)',
        paddingLeft: 14,
        paddingRight: 14,
        paddingTop: 6,
        paddingBottom: 6,
        fontSize: 10,
        letterSpacing: '0.04em',
        color: 'white',
        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
      }}>
        <span style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: '#06C755',
          flexShrink: 0,
        }} />
        LINEだけで動く、AIカウンセリング
      </div>

      {/* Phone bezel */}
      <div style={{
        position: 'relative',
        borderRadius: '34px',
        backgroundColor: 'var(--c-fg)',
        padding: 8,
        boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Notch */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 8,
            zIndex: 10,
            width: 80,
            height: 16,
            marginLeft: -40,
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
            backgroundColor: 'var(--c-fg)',
          }}
        />

        <div style={{
          overflow: 'hidden',
          borderRadius: '26px',
          backgroundColor: '#F7F2EA',
        }}>
          {/* Phone header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'white',
            paddingLeft: 12,
            paddingRight: 12,
            paddingTop: 10,
            paddingBottom: 10,
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--c-fg)',
          }}>
            <span style={{ color: 'var(--c-accent)' }}>›</span>
            SalonRink
            <span style={{ marginLeft: 'auto', color: '#999' }}>···</span>
          </div>

          {/* Chat body */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            paddingLeft: 12,
            paddingRight: 12,
            paddingTop: 12,
            paddingBottom: 12,
            fontSize: 10,
            lineHeight: 1.6,
          }}>
            {/* Bot message */}
            <div style={{
              maxWidth: '85%',
              borderRadius: '16px',
              borderTopLeftRadius: 4,
              backgroundColor: 'white',
              paddingLeft: 12,
              paddingRight: 12,
              paddingTop: 8,
              paddingBottom: 8,
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
            }}>
              カラー施術前のカウンセリングご回答ください 😊
            </div>

            {/* User action */}
            <div style={{
              marginLeft: 'auto',
              display: 'inline-block',
              borderRadius: '9999px',
              backgroundColor: '#06C755',
              paddingLeft: 12,
              paddingRight: 12,
              paddingTop: 6,
              paddingBottom: 6,
              color: 'white',
            }}>
              アンケートを始める
            </div>

            {/* Bot question */}
            <div style={{
              maxWidth: '90%',
              borderRadius: '16px',
              borderTopLeftRadius: 4,
              backgroundColor: 'white',
              paddingLeft: 12,
              paddingRight: 12,
              paddingTop: 8,
              paddingBottom: 8,
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
            }}>
              Q. 過去にカラーで頭皮にかゆみや赤みは出ましたか?
            </div>

            {/* Options */}
            <div style={{
              display: 'flex',
              gap: 6,
            }}>
              <span style={{
                flex: 1,
                borderRadius: '9999px',
                backgroundColor: 'white',
                paddingLeft: 12,
                paddingRight: 12,
                paddingTop: 6,
                paddingBottom: 6,
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                fontSize: 10,
              }}>はい</span>
              <span style={{
                flex: 1,
                borderRadius: '9999px',
                backgroundColor: 'white',
                paddingLeft: 12,
                paddingRight: 12,
                paddingTop: 6,
                paddingBottom: 6,
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                fontSize: 10,
              }}>いいえ</span>
            </div>

            {/* AI summary card */}
            <div style={{
              borderRadius: '12px',
              border: '1px solid rgba(201, 169, 97, 0.2)',
              backgroundColor: 'white',
              paddingLeft: 12,
              paddingRight: 12,
              paddingTop: 10,
              paddingBottom: 10,
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
            }}>
              <div style={{
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 8,
                letterSpacing: '0.2em',
                color: 'var(--c-accent)',
              }}>
                <span style={{ width: 12, height: '1px', backgroundColor: 'var(--c-accent)' }} />V AI まとめ
              </div>
              <div style={{
                marginBottom: 4,
                fontWeight: 600,
                color: 'var(--c-fg)',
              }}>
                <span style={{ marginRight: 4, color: 'var(--c-accent)' }}>ⓘ</span>過去の申告内容を表示
              </div>
              <p style={{
                color: '#666',
                margin: 0,
                fontSize: 9,
                lineHeight: 1.5,
              }}>
                お客様が過去にご申告された内容を整理しています。施術前にスタイリストへご相談ください。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
