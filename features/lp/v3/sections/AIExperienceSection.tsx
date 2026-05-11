'use client';

import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';

interface AIExperienceSectionProps {
  onStart: () => void;
}

export default function AIExperienceSection({ onStart }: AIExperienceSectionProps) {
  return (
    <section
      className="section"
      style={{
        background: 'linear-gradient(135deg, #FAF0E0 0%, #F8E8D5 100%)',
      }}
    >
      <div className="container" style={{ maxWidth: 680, textAlign: 'center' }}>
        <FadeUp>
          <div
            className="eyebrow"
            style={{
              color: 'var(--c-accent-2)',
              letterSpacing: '0.24em',
              fontSize: 12,
            }}
          >
            AI EXPERIENCE
          </div>
        </FadeUp>

        <FadeUp delay={80}>
          <h2
            className="h2"
            style={{
              marginTop: 16,
              fontFamily: 'var(--f-display)',
              fontWeight: 700,
              fontSize: 'clamp(28px, 6vw, 48px)',
            }}
          >
            美容師の経験 × AI の記憶。
          </h2>
        </FadeUp>

        <FadeUp delay={140}>
          <p
            style={{
              marginTop: 12,
              fontSize: 'clamp(16px, 2.2vw, 18px)',
              color: 'var(--c-fg-3)',
              lineHeight: 1.7,
              fontWeight: 400,
            }}
          >
            あなたの15年は、データに置き換えられない。
          </p>
        </FadeUp>

        <FadeUp delay={200}>
          <p
            className="lede"
            style={{
              marginTop: 18,
              fontSize: 'clamp(14px, 2vw, 16px)',
              color: 'var(--c-fg-3)',
              lineHeight: 1.9,
            }}
          >
            AI は雑用と記憶のサポート。判断と感性は、いつもあなたの中に。
            <br />
            お客様1人の体験を、2分で実感してください。
          </p>
        </FadeUp>

        <FadeUp delay={260}>
          <button
            className="btn btn-lg"
            onClick={onStart}
            style={{
              marginTop: 36,
              background: 'var(--c-accent)',
              color: 'var(--c-on-accent)',
              fontWeight: 700,
              fontSize: 16,
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 16px rgba(200, 163, 102, 0.2)',
              border: 'none',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                'translateY(-2px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 8px 24px rgba(200, 163, 102, 0.3)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                'translateY(0)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 4px 16px rgba(200, 163, 102, 0.2)';
            }}
          >
            <span>▶</span> AI と美容師の共演を体験する
          </button>
        </FadeUp>

        <FadeUp delay={320}>
          <p
            style={{
              marginTop: 20,
              fontSize: 'clamp(12px, 1.8vw, 13px)',
              color: 'var(--c-fg-4)',
              lineHeight: 1.8,
              fontWeight: 400,
            }}
          >
            クレジット不要・メアドだけ・体験完了で資料配信
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
