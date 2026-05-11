'use client';

import React from 'react';
import Section from './Section';
import SectionHeader from './SectionHeader';
import Card from './Card';
import FadeUp from './FadeUp';

const steps = [
  {
    number: '01',
    title: 'お申し込み',
    description: '月額 ¥1,980 から、必要な機能だけ選んで開始できます。クレジットカード登録のみで、設定後すぐに使い始められます。',
  },
  {
    number: '02',
    title: 'LINE 公式アカウントと接続',
    description: 'お持ちの LINE 公式アカウントをそのまま接続、または新規開設のサポートをご利用いただけます。',
  },
  {
    number: '03',
    title: 'ご来店時から、自動で記録',
    description: 'お客様が予約を入れた瞬間から、AI カルテが立ち上がります。スタッフ全員でリアルタイムに共有。',
  },
];

export default function Steps() {
  return (
    <Section className="bg-[var(--c-bg)]">
      <SectionHeader title="始め方は、3 ステップ。" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {steps.map((step, index) => (
          <FadeUp key={index} delay={index * 100}>
            <Card className="bg-[var(--c-bg-2)] border-[var(--c-border-2)]">
              <span className="font-cormorant text-5xl md:text-6xl text-[var(--c-accent)] opacity-80 block mb-4">
                {step.number}
              </span>
              <h3 className="font-serif text-xl md:text-2xl text-[var(--c-fg)] mb-3">
                {step.title}
              </h3>
              <p className="font-sans text-base leading-relaxed text-[var(--c-fg)] opacity-80">
                {step.description}
              </p>
            </Card>
          </FadeUp>
        ))}
      </div>
    </Section>
  );
}
