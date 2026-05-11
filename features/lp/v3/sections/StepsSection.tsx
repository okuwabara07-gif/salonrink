'use client';

import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';

const STEPS = [
  {
    n: '01',
    t: 'LINE追加',
    d: 'LINEで友だち追加するだけ。\nQRを読み取って簡単スタート。',
    img: '/v3/step-01-line-qr.webp',
  },
  {
    n: '02',
    t: '質問に回答',
    d: 'お客様がLINEで質問に回答。\n事前カウンセリングが完了。',
    img: '/v3/step-02-chat.webp',
  },
  {
    n: '03',
    t: 'AIがカルテ生成',
    d: 'AIが回答内容をもとに自動で\nカルテを作成・整理。',
    img: '/v3/step-03-tablet.webp',
  },
  {
    n: '04',
    t: '提案に活用',
    d: 'カルテをもとに最適な提案が可能。\n満足度UPでリピートも促進。',
    img: '/v3/step-04-staff.webp',
  },
];

type Props = {
  onCta?: () => void;
};

export default function StepsSection({ onCta }: Props) {
  return (
    <section className="section section-cream" id="steps">
      <div className="container">
        <FadeUp>
          <h2 className="h2" style={{ textAlign: 'center' }}>
            使い方はカンタン <span className="accent">4ステップ</span>
          </h2>
        </FadeUp>
        <FadeUp delay={80}>
          <p className="lede" style={{ textAlign: 'center', marginTop: 14, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
            LINEでつながるだけで、AIがサロン業務をもっとスマートに。
          </p>
        </FadeUp>

        <div className="steps-grid">
          {STEPS.map((s, i) => (
            <div key={s.n} className="step-card">
              <FadeUp delay={i * 80}>
                <span className="step-num-circle">{s.n}</span>

                {/* Image - temporarily hidden until files are provided */}
                {s.img && (
                  <div style={{
                    width: '100%',
                    aspectRatio: '3/4',
                    background: 'var(--c-bg-2)',
                    marginTop: 12,
                    overflow: 'hidden',
                    borderRadius: 'var(--r-md)',
                  }}>
                    <img
                      src={s.img}
                      alt={s.t}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </div>
                )}

                <div className="step-card-title">{s.t}</div>
                <div className="step-card-desc">{s.d}</div>
              </FadeUp>

              {/* Arrow (desktop only, not on last card) */}
              {i < STEPS.length - 1 && (
                <span className="step-arrow" aria-hidden="true">›</span>
              )}
            </div>
          ))}
        </div>

        <FadeUp delay={400}>
          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <button className="btn btn-primary btn-lg" onClick={onCta}>
              14日間無料で試す <Icon name="arrowRight" size={14} />
            </button>
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--c-fg-3)' }}>
              クレジットカード不要
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
