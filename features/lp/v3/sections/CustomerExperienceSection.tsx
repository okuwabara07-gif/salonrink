'use client';

import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';

type Props = {
  onStart?: () => void;
};

export default function CustomerExperienceSection({ onStart }: Props) {
  return (
    <section
      id="customer-experience"
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #E6F9F0 0%, #D4F1E0 100%)',
        paddingTop: 80,
        paddingBottom: 80,
      }}
    >
      <div className="container">
        <FadeUp>
          {/* FOR CUSTOMERS label */}
          <p style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.32em',
            color: '#06C755',
            marginBottom: 28,
            marginTop: 0,
          }}>
            <span style={{ width: 32, height: '1px', backgroundColor: '#06C755' }} />
            FOR CUSTOMERS
          </p>

          {/* Main heading */}
          <h2 style={{
            fontFamily: 'var(--f-display)',
            fontSize: '36px',
            lineHeight: 1.45,
            letterSpacing: '0.02em',
            color: 'var(--c-fg)',
            marginTop: 0,
            marginBottom: 20,
            fontWeight: 'bold',
          }}>
            あなたを、覚えてくれるサロンへ。
          </h2>

          {/* Sub heading */}
          <p style={{
            fontFamily: 'var(--f-body)',
            fontSize: '16px',
            lineHeight: 1.6,
            color: 'var(--c-fg-2)',
            marginTop: 0,
            marginBottom: 28,
          }}>
            毎回ゼロから話すサロンと、あなたを大切に覚えてくれるサロン。
          </p>

          {/* Description */}
          <p style={{
            fontFamily: 'var(--f-body)',
            fontSize: '15px',
            lineHeight: 1.7,
            color: 'var(--c-fg)',
            marginTop: 0,
            marginBottom: 40,
            maxWidth: '600px',
          }}>
            事前カウンセリング、好みの記録、安心の継続性。<br />
            お客様体験は、もう一歩進んだ場所にあります。<br />
            あなたが「お客様」として、その違いを2分で体感してみませんか?
          </p>

          {/* Main CTA */}
          <button
            onClick={onStart}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              paddingLeft: 28,
              paddingRight: 28,
              paddingTop: 16,
              paddingBottom: 16,
              fontSize: '16px',
              fontWeight: 600,
              color: 'white',
              backgroundColor: '#06C755',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#05B84E';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(6, 199, 85, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#06C755';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span>▶</span> お客様体験ツアーをはじめる
          </button>

          {/* Footnote */}
          <p style={{
            marginTop: 32,
            fontSize: '13px',
            color: 'var(--c-fg-3)',
            marginBottom: 0,
          }}>
            あなたのサロンにこの体験を、と思った方は
            <br />
            <span style={{ fontWeight: 600 }}>メアド入力で詳細送付</span>
            できます。
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
