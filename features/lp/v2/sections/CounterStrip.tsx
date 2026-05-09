import React from 'react';
import Container from '../components/Container';

export default function CounterStrip() {
  return (
    <section className="bg-[var(--c-bg-2)] border-b border-[var(--c-border-2)] py-3">
      <Container>
        <div className="flex items-center justify-center gap-2 text-sm">
          {/* Pulse Dot */}
          <div
            className="w-2 h-2 bg-[#06c755] rounded-full flex-shrink-0"
            style={{
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />

          {/* Text */}
          <span className="text-[var(--c-fg-3)]">現在</span>
          <span className="font-cormorant font-bold text-[var(--c-accent)]">
            ベータ版
          </span>
          <span className="text-[var(--c-fg-3)]">として運用中・先着サロン募集</span>
        </div>
      </Container>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </section>
  );
}
