'use client';

import { useState, useRef, useEffect } from 'react';
import FadeUp from '@/features/lp/v3/components/FadeUp';
import AnimatedNum from '@/features/lp/v3/components/AnimatedNum';
import ImageSlot from '@/features/lp/v3/components/ImageSlot';

export default function BeforeAfter() {
  const [pos, setPos] = useState(50);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromEvent = (e: MouseEvent | TouchEvent) => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const x = ((e as TouchEvent).touches?.[0]?.clientX ?? (e as MouseEvent).clientX) - rect.left;
    setPos(Math.max(4, Math.min(96, (x / rect.width) * 100)));
  };

  useEffect(() => {
    const move = (e: MouseEvent | TouchEvent) => {
      if (dragging.current) updateFromEvent(e);
    };
    const up = () => {
      dragging.current = false;
    };
    window.addEventListener('mousemove', move as EventListener);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move as EventListener);
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move as EventListener);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move as EventListener);
      window.removeEventListener('touchend', up);
    };
  }, []);

  return (
    <section className="section section-soft">
      <div className="container">
        <FadeUp>
          <div className="eyebrow" style={{ textAlign: 'center', display: 'block' }}>BEFORE / AFTER</div>
        </FadeUp>
        <FadeUp delay={80}>
          <h2 className="h2" style={{ marginTop: 14, textAlign: 'center' }}>
            紙のカルテと、AIカルテ。<br />
            差は、これくらい違う。
          </h2>
        </FadeUp>
        <FadeUp delay={140}>
          <div
            ref={wrapRef}
            className="ba-wrap"
            style={{ '--ba-pos': `${pos}%` } as React.CSSProperties & { '--ba-pos': string }}
            onMouseDown={(e) => {
              dragging.current = true;
              updateFromEvent(e as unknown as MouseEvent);
            }}
            onTouchStart={(e) => {
              dragging.current = true;
              updateFromEvent(e as unknown as TouchEvent);
            }}
          >
            <div className="ba-side ba-before">
              <ImageSlot id="ba-before" placeholder="紙のカルテで作業している様子" src="/v3/ba-before.png" alt="紙のカルテで作業している様子" />
            </div>
            <div className="ba-side ba-after">
              <ImageSlot id="ba-after" placeholder="iPadでAIカルテを使っている様子" src="/v3/ba-after.png" alt="iPadでAIカルテを使っている様子" />
            </div>
            <div className="ba-label l">BEFORE 紙カルテ</div>
            <div className="ba-label r">AFTER SalonRink</div>
            <div className="ba-handle" />
          </div>
        </FadeUp>
        <FadeUp delay={200}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 28, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
            {[
              { v: 15, s: '分→3分', l: 'カウンセリング時間' },
              { v: 0, s: '件', l: '聞き漏れ' },
              { v: 75, s: '%', l: '業務時間削減' },
            ].map((k, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div className="num" style={{ fontFamily: 'var(--f-num)', fontSize: 32, color: 'var(--c-accent-2)' }}>
                  <AnimatedNum value={k.v} />
                  <small style={{ fontSize: 14, marginLeft: 2 }}>{k.s}</small>
                </div>
                <div style={{ fontSize: 11, color: 'var(--c-fg-3)', marginTop: 4 }}>{k.l}</div>
              </div>
            ))}
          </div>
        </FadeUp>
        <FadeUp delay={260}>
          <div style={{ fontSize: 11, color: 'var(--c-fg-3)', marginTop: 20, lineHeight: 1.7, textAlign: 'center' }}>
            ※ 運用実績に基づくモデル値です（参考値）
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
