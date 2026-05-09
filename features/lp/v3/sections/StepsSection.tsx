'use client';

import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';

const STEPS = [
  { n: '01', t: 'LINEで友だち追加', d: 'お客様にQRを案内するだけ。' },
  { n: '02', t: 'お客様が質問に回答', d: '事前カウンセリングを送信。' },
  { n: '03', t: 'AIがカルテを自動生成', d: '情報を構造化・整理。' },
  { n: '04', t: '施術・提案に活用', d: '売上・リピートUP。' },
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
        <div className="steps-grid" style={{ marginTop: 48 }}>
          {STEPS.map((s, i) => (
            <FadeUp key={s.n} delay={i * 80}>
              <div className="step-card">
                <span className="step-num-circle">{s.n}</span>
                <div className="step-card-title">{s.t}</div>
                <div className="step-card-desc">{s.d}</div>
              </div>
            </FadeUp>
          ))}
        </div>
        <FadeUp delay={400}>
          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <button className="btn btn-primary btn-lg" onClick={onCta}>
              14日間無料で試す <Icon name="arrowRight" size={14} />
            </button>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
