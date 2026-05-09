'use client';

import FadeUp from '@/features/lp/v3/components/FadeUp';
import ImageSlot from '@/features/lp/v3/components/ImageSlot';

const PERSONAS = [
  { ph: '個人美容師がスマホを見ている写真', t: '個人事業主・面貸し美容師', d: 'シンプルなプランから始めて、自分のペースで運用できます。' },
  { ph: '中規模サロンチームの集合写真', t: '中規模サロン（4〜10名）', d: 'スタッフ間の引き継ぎとカルテ共有を一元化。' },
  { ph: 'コンサルが店舗運営を分析している写真', t: '経営コンサル・複数店舗', d: '店舗横断の数値比較・経営判断をサポート。' },
];

export default function PersonaSection() {
  return (
    <section className="section section-cream">
      <div className="container">
        <FadeUp>
          <div className="eyebrow" style={{ textAlign: 'center', display: 'block' }}>FOR WHO</div>
        </FadeUp>
        <FadeUp delay={80}>
          <h2 className="h2" style={{ marginTop: 14, textAlign: 'center' }}>
            こんなサロンに、<br />
            選ばれています。
          </h2>
        </FadeUp>
        <div className="grid-3" style={{ marginTop: 40 }}>
          {PERSONAS.map((p, i) => (
            <FadeUp key={i} delay={i * 80}>
              <div className="prob">
                <div className="prob-img">
                  <ImageSlot id={`persona-${i}`} placeholder={p.ph} />
                </div>
                <div className="prob-body" style={{ textAlign: 'left', padding: 22 }}>
                  <div className="h3" style={{ fontSize: 18, marginBottom: 8 }}>
                    {p.t}
                  </div>
                  <p style={{ color: 'var(--c-fg-3)', fontSize: 13, lineHeight: 1.85, margin: 0, fontFamily: 'var(--f-body)', fontWeight: 400 }}>
                    {p.d}
                  </p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
