import React from 'react';
import Section from './Section';
import SectionHeader from './SectionHeader';
import Card from './Card';
import FadeUp from './FadeUp';

const operations = [
  {
    title: '対応に追われる時間が、減る。',
    description: '予約のやり取りも、カウンセリング前のヒアリングも、LINE の中で自動的に整います。',
  },
  {
    title: '引き継ぎのもれが、なくなる。',
    description: 'AI が記録を構造化するので、誰が見ても同じ情報がそこにあります。',
  },
  {
    title: 'あとは、お客様と向き合うだけ。',
    description: 'いつものサロンワークの中身が、そのまま、密度を増します。',
  },
];

export default function Operations() {
  return (
    <Section className="bg-[var(--c-bg-2)]">
      <SectionHeader title="施術と、会話の時間が、戻ってくる。" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {operations.map((item, index) => (
          <FadeUp key={index} delay={index * 100}>
            <Card className="bg-[var(--c-bg)] border-[var(--c-border-2)]">
              <h3 className="font-serif text-xl md:text-2xl text-[var(--c-fg)] mb-4">
                {item.title}
              </h3>
              <p className="font-sans text-base leading-relaxed text-[var(--c-fg)] opacity-80">
                {item.description}
              </p>
            </Card>
          </FadeUp>
        ))}
      </div>
    </Section>
  );
}
