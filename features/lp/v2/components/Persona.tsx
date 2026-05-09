import React from 'react';
import { User, Store, Building2 } from 'lucide-react';
import Section from './Section';
import SectionHeader from './SectionHeader';
import Card from './Card';
import FadeUp from './FadeUp';

const personas = [
  {
    icon: User,
    label: 'フリーランスの方へ',
    name: 'ハナさん / 28 歳 / 美容師 5 年目',
    situation: '1 人で施術、SNS 中心の集客',
    quote: '「LINE と Instagram で予約をいただいているけれど、メッセージのやり取りだけで時間が過ぎていく。施術中も着信が気になる。」',
    set: 'Set A',
    price: '¥2,780 / 月',
    note: '集客は今のまま、対応は LINE に任せる構成。',
  },
  {
    icon: Store,
    label: '個人サロン経営の方へ',
    name: 'タカシさん / 38 歳 / オーナー兼スタイリスト / スタッフ 2-3 名',
    situation: 'HPB と LINE 両方から予約、引き継ぎ標準化が課題',
    quote: '「HPB と LINE の両方で予約が来る。スタッフごとにカウンセリングの粒度がばらつく。引き継ぎが追いつかない。」',
    set: 'Set B',
    price: '¥2,980 / 月',
    note: 'HotPepper Beauty 連携と LINE をひとつに。AI カルテで誰が見ても同じ情報。',
  },
  {
    icon: Building2,
    label: '複数店舗・チーム運営の方へ',
    name: 'キョウコさん / 45 歳 / 店長 / スタッフ 5 名以上',
    situation: '複数店舗、新人教育、リピート率の構造化が課題',
    quote: '「店舗ごとに運用が違う。新人教育に時間が取られる。リピート率を、感覚ではなく仕組みで上げたい。」',
    set: 'Set C',
    price: '¥4,580 / 月',
    note: 'HPB / Advanced AI / Minimo(提供時)を統合。チーム運用に。',
  },
];

export default function Persona() {
  return (
    <Section className="bg-[var(--c-bg)]">
      <SectionHeader title="あなたのサロンに、ちょうどいい組み合わせを。" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {personas.map((persona, index) => {
          const Icon = persona.icon;
          return (
            <FadeUp key={index} delay={index * 100}>
              <Card className="bg-[var(--c-bg-2)] border-[var(--c-border-2)] flex flex-col h-full">
                <Icon className="w-8 h-8 text-[var(--c-accent)] mb-4" />
                <p className="font-mono text-xs uppercase tracking-wider opacity-60 mb-2">
                  {persona.label}
                </p>
                <p className="font-serif text-base text-[var(--c-fg)] mb-1">
                  {persona.name}
                </p>
                <p className="font-sans text-sm text-[var(--c-fg)] opacity-70 mb-4">
                  {persona.situation}
                </p>
                <blockquote className="font-serif text-sm leading-relaxed border-l-2 border-[var(--c-accent)] pl-4 mb-6 text-[var(--c-fg)] opacity-80">
                  {persona.quote}
                </blockquote>
                <div className="mt-auto">
                  <p className="font-cormorant text-sm text-[var(--c-accent)] tracking-wider uppercase mb-1">
                    {persona.set}
                  </p>
                  <p className="font-serif text-2xl md:text-3xl text-[var(--c-fg)] mb-3">
                    {persona.price}
                  </p>
                  <p className="font-sans text-sm text-[var(--c-fg)] opacity-80">
                    {persona.note}
                  </p>
                </div>
              </Card>
            </FadeUp>
          );
        })}
      </div>
      <div className="mt-8 text-center">
        <p className="font-mono text-xs opacity-60">
          ※ 上記は架空のペルソナによる活用例です。実在する人物・サロンを表すものではありません。
        </p>
      </div>
    </Section>
  );
}
