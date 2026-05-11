'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

const Item = ({ visible, children }: { visible: boolean; children: React.ReactNode }) => (
  <div
    style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(8px)',
      transition: 'opacity 350ms ease, transform 350ms ease',
    }}
  >
    {children}
  </div>
);

export default function ChatMockMini() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const delays = [600, 700, 900, 700, 900];
    let cancelled = false;
    let i = 0;

    const tick = () => {
      if (cancelled) return;
      i += 1;
      setStep(i);
      if (i < delays.length) {
        setTimeout(tick, delays[i]);
      }
    };

    setTimeout(tick, delays[0]);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col bg-[var(--c-bg-card)] rounded-[18px] border border-[var(--c-border)] overflow-hidden shadow-sm w-full max-w-xs">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--c-border-2)] bg-[var(--c-bg)]">
        <div className="flex items-center gap-2">
          <ArrowLeft size={12} className="text-[var(--c-fg-3)]" />
          <span className="text-sm font-medium text-[var(--c-fg)]">SalonRink</span>
        </div>
        <span className="text-[var(--c-fg-3)]">⋯</span>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-3 space-y-3 max-h-96 overflow-y-auto">
        {/* Step 1: Initial message */}
        <Item visible={step >= 1}>
          <div className="flex justify-start mb-2">
            <div className="bg-[var(--c-bg-2)] text-[var(--c-fg)] text-xs px-3 py-2 rounded-lg max-w-xs">
              カラー施術前のカウンセリングにご回答ください
            </div>
          </div>
        </Item>

        {/* Step 2: User action button */}
        <Item visible={step >= 2}>
          <div className="flex justify-end mb-2">
            <button className="bg-[var(--c-accent)] text-[var(--c-on-accent)] text-xs px-3 py-2 rounded-lg">
              アンケートを始める
            </button>
          </div>
        </Item>

        {/* Step 3: Question */}
        <Item visible={step >= 3}>
          <div className="flex justify-start mb-2">
            <div className="bg-[var(--c-bg-2)] text-[var(--c-fg)] text-xs px-3 py-2 rounded-lg max-w-xs">
              Q. 過去にカラーで頭皮にかゆみや赤みは出ましたか？
            </div>
          </div>
        </Item>

        {/* Step 4: Choice buttons */}
        <Item visible={step >= 4}>
          <div className="flex justify-start gap-2 mb-2">
            <button className="bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-fg)] text-xs px-3 py-2 rounded-lg hover:bg-[var(--c-bg-card)]">
              はい
            </button>
            <button className="bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-fg)] text-xs px-3 py-2 rounded-lg hover:bg-[var(--c-bg-card)]">
              いいえ
            </button>
          </div>
        </Item>

        {/* Step 5: AI Summary Card */}
        <Item visible={step >= 5}>
          <div className="bg-[var(--c-accent-soft)] border border-[var(--c-accent)] rounded-lg p-3 text-xs">
            <div className="font-semibold text-[var(--c-fg)] mb-2">∨ AIまとめ</div>
            <div className="text-[var(--c-fg-3)] leading-relaxed">
              お客様が過去にご申告された内容を整理しています。施術前にスタイリストへご相談ください。
            </div>
          </div>
        </Item>
      </div>
    </div>
  );
}
