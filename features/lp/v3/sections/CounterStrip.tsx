'use client';

import AnimatedNum from '@/features/lp/v3/components/AnimatedNum';

export default function CounterStrip() {
  return (
    <div className="counter-strip">
      <span className="pulse-dot" />
      <span style={{ opacity: 0.7 }}>全国の</span>
      <span className="num" style={{ fontSize: 18, color: 'var(--c-accent)' }}>
        <AnimatedNum value={523} />
      </span>
      <span style={{ opacity: 0.7 }}>のサロンが利用中</span>
    </div>
  );
}
