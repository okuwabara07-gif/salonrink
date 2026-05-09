'use client';

import React from 'react';
import Section from './Section';
import Button from './Button';
import FadeUp from './FadeUp';

export default function FinalCta() {
  return (
    <Section className="bg-[var(--c-bg-2)]">
      <FadeUp>
        <div className="text-center py-24 md:py-32">
          <p className="font-cormorant italic text-2xl md:text-3xl text-[var(--c-accent)] opacity-60 tracking-wide mb-4">
            Begin
          </p>
          <h2 className="font-serif text-4xl md:text-6xl text-[var(--c-fg)] leading-tight mb-6">
            いつもの、その先へ。
          </h2>
          <p className="font-sans text-lg md:text-xl text-[var(--c-fg)] opacity-70 mb-10">
            今日から、14 日間。
          </p>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <Button variant="primary" href="/signup">
              14 日間、無料で試す
            </Button>
            <Button variant="ghost" href="/download">
              資料をダウンロード
            </Button>
          </div>
        </div>
      </FadeUp>
    </Section>
  );
}
