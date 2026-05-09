'use client';

export default function CounterStrip() {
  return (
    <div className="counter-strip">
      <span className="pulse-dot" />
      <span style={{ opacity: 0.7 }}>現在</span>
      <span style={{ color: 'var(--c-accent)', fontWeight: 600 }}>ベータ版として運用中</span>
      <span style={{ opacity: 0.7 }}>・先着サロン募集</span>
    </div>
  );
}
