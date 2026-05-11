'use client';

import { useState } from 'react';
import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';
import AnimatedNum from '@/features/lp/v3/components/AnimatedNum';

type Props = {
  onCta?: () => void;
};

export default function RoiSim({ onCta }: Props) {
  const [staff, setStaff] = useState(5);
  const [revenue, setRevenue] = useState(300);
  const monthlySavings = staff * 3000 * 10 * 4;
  const monthlyCost = 2980;
  const repeatLift = revenue * 10000 * 0.15;
  const total = monthlySavings + repeatLift - monthlyCost;

  return (
    <section className="section section-cream">
      <div className="container">
        <FadeUp>
          <div className="eyebrow" style={{ textAlign: 'center', display: 'block' }}>ROI SIMULATOR</div>
        </FadeUp>
        <FadeUp delay={80}>
          <h2 className="h2" style={{ marginTop: 14, textAlign: 'center' }}>
            あなたのサロンで、<br />
            どれくらい変わる？
          </h2>
        </FadeUp>
        <FadeUp delay={140}>
          <div className="roi-card" style={{ marginTop: 40 }}>
            <div>
              <div className="roi-input-row">
                <label>
                  スタッフ数{' '}
                  <span className="val" style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'baseline' }}>
                    {staff}
                    <small style={{ fontSize: 12, marginLeft: 2, color: 'var(--c-fg-3)' }}>名</small>
                  </span>
                </label>
                <input className="roi-slider" type="range" min={1} max={20} value={staff} onChange={(e) => setStaff(+e.target.value)} />
              </div>
              <div className="roi-input-row">
                <label>
                  月商{' '}
                  <span className="val" style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'baseline' }}>
                    {revenue}
                    <small style={{ fontSize: 12, marginLeft: 2, color: 'var(--c-fg-3)' }}>万円</small>
                  </span>
                </label>
                <input className="roi-slider" type="range" min={50} max={2000} step={10} value={revenue} onChange={(e) => setRevenue(+e.target.value)} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--c-fg-3)', marginTop: 18, lineHeight: 1.7 }}>
                ※ 業務時間削減（時給3,000円換算）+ リピート効果向上の試算
                <br />
                ※ ベータ期間中の聞き取りに基づくモデル値です
              </div>
            </div>
            <div className="roi-divider" />
            <div className="roi-result">
              <div style={{ fontSize: 12, color: 'var(--c-fg-3)', letterSpacing: '0.16em' }}>月間メリット試算</div>
              <div className="roi-big">
                +¥<AnimatedNum value={Math.round(total / 1000) * 1000} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--c-fg-3)', textAlign: 'center', lineHeight: 1.7 }}>
                時間削減: ¥{monthlySavings.toLocaleString()}
                <br />
                売上UP: ¥{Math.round(repeatLift).toLocaleString()}
                <br />
                月額: -¥{monthlyCost.toLocaleString()}
              </div>
              <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={onCta}>
                14日間無料で試す <Icon name="arrowRight" size={14} />
              </button>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
