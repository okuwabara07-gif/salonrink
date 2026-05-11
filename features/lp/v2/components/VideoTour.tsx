import React from 'react';
import Section from './Section';
import SectionHeader from './SectionHeader';
import FadeUp from './FadeUp';

const stages = [
  {
    label: '予約から、カウンセリングまで',
    description: 'LINE で予約をいただく時に、お客様自身がご希望を入力。来店前の準備が整う。',
  },
  {
    label: '施術中の、共有',
    description: 'AI が記録を構造化。スタッフ全員が、お客様の「いつも」を一目で確認できる。',
  },
  {
    label: '来店後の、関係づくり',
    description: '次のお手入れの目安や、季節のご案内が、お客様一人ひとりのタイミングで届く。',
  },
];

export default function VideoTour() {
  return (
    <Section className="bg-[var(--c-bg)]">
      <SectionHeader title="30 秒で、全体像。" />
      <div className="max-w-4xl mx-auto mb-12">
        <FadeUp>
          <div className="relative aspect-video rounded-lg overflow-hidden border border-[var(--c-border-2)] bg-[var(--c-bg-2)]">
            <video
              className="w-full h-full"
              controls
              playsInline
              preload="metadata"
              poster="/video-tour-poster.jpg"
            >
              <source src="/video-tour.mp4" type="video/mp4" />
              お使いのブラウザは動画再生に対応していません。
            </video>
          </div>
        </FadeUp>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
        {stages.map((stage, index) => (
          <FadeUp key={index} delay={(index + 1) * 100}>
            <div className="text-center md:text-left">
              <p className="font-mono text-xs uppercase tracking-wider text-[var(--c-accent)] mb-3">
                {String(index + 1).padStart(2, '0')}
              </p>
              <p className="font-serif text-lg md:text-xl text-[var(--c-fg)] mb-2 leading-tight">
                {stage.label}
              </p>
              <p className="font-sans text-sm leading-relaxed text-[var(--c-fg)] opacity-80">
                {stage.description}
              </p>
            </div>
          </FadeUp>
        ))}
      </div>
      <p className="font-mono text-xs opacity-60 text-center mt-8 max-w-2xl mx-auto">
        ※ 上記はサービス概要の紹介映像です。実際の操作画面は提供時期により異なる場合があります。
      </p>
    </Section>
  );
}
