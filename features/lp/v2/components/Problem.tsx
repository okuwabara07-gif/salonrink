'use client';

import React from 'react';
import { Clock, Users, FileText, HeartHandshake } from 'lucide-react';
import Section from './Section';
import SectionHeader from './SectionHeader';
import Card from './Card';
import FadeUp from './FadeUp';

const problems = [
  {
    icon: Clock,
    text: '予約のやり取りで、施術の手が止まっていないか。',
  },
  {
    icon: Users,
    text: 'お客様の好みや履歴を、スタッフ全員で見られているか。',
  },
  {
    icon: FileText,
    text: 'カウンセリングの記録が、人によってばらついていないか。',
  },
  {
    icon: HeartHandshake,
    text: '来店後の関係づくりを、感覚だけに委ねていないか。',
  },
];

export default function Problem() {
  return (
    <Section className="bg-[var(--c-bg)]">
      <SectionHeader
        title="日々の現場で、こうしたことはありませんか。"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {problems.map((problem, index) => {
          const Icon = problem.icon;
          return (
            <FadeUp key={index} delay={index * 80}>
              <Card
                className="bg-[var(--c-bg-2)] border-[var(--c-border-2)] transition-colors duration-300 hover:border-[var(--c-accent)]"
              >
                <Icon className="w-8 h-8 text-[var(--c-accent)] mb-4" />
                <p className="font-serif text-base md:text-lg leading-relaxed text-[var(--c-fg)]">
                  {problem.text}
                </p>
              </Card>
            </FadeUp>
          );
        })}
      </div>
    </Section>
  );
}
