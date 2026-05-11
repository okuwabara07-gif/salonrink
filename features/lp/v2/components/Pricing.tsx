import React from 'react';
import { Check } from 'lucide-react';
import Section from './Section';
import SectionHeader from './SectionHeader';
import Card from './Card';
import Button from './Button';
import FadeUp from './FadeUp';

const plans = [
  {
    label: 'フリーランス向け',
    name: 'Set A',
    price: '¥2,780',
    period: '/ 月(税込)',
    features: [
      'LINE 予約・カウンセリング連携',
      'AI カルテ(基本)',
      'Advanced AI 解析',
    ],
    recommendation: 'お一人で運営される方',
    isFeatured: false,
  },
  {
    label: '個人サロン経営向け',
    name: 'Set B',
    price: '¥2,980',
    period: '/ 月(税込)',
    features: [
      'LINE 予約・カウンセリング連携',
      'AI カルテ(基本)',
      'HotPepper Beauty 自動同期',
    ],
    recommendation: 'スタッフ複数名、HPB 集客中心の方',
    isFeatured: true,
  },
  {
    label: '複数店舗・チーム向け',
    name: 'Set C',
    price: '¥4,580',
    period: '/ 月(税込)',
    features: [
      'LINE / HotPepper Beauty 連携',
      'AI カルテ(基本)',
      'Advanced AI 解析',
      'Minimo 連携(提供開始時に自動有効化)',
    ],
    recommendation: '複数スタッフ・複数店舗',
    isFeatured: false,
  },
];

const notes = [
  '初期費用 ¥3,000(SNS シェアで無料)',
  '年契約で 2 ヶ月分相当の割引',
  '表示はすべて税込',
  'LINE 経由予約 1 件につき別途 ¥100 のオプション手数料(任意機能)',
];

export default function Pricing() {
  return (
    <Section className="bg-[var(--c-bg-2)]">
      <SectionHeader title="必要な分だけ、選べる料金。" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-stretch">
        {plans.map((plan, index) => (
          <FadeUp key={index} delay={index * 100}>
            <div className={`relative h-full ${plan.isFeatured ? 'md:-translate-y-2' : ''}`}>
              {plan.isFeatured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--c-accent)] text-white px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider z-10">
                  おすすめ
                </span>
              )}
              <Card
                className={`h-full flex flex-col bg-[var(--c-bg)] ${
                  plan.isFeatured
                    ? 'border-2 border-[var(--c-accent)]'
                    : 'border border-[var(--c-border-2)]'
                }`}
              >
                <p className="font-mono text-xs uppercase tracking-wider opacity-60 mb-2">
                  {plan.label}
                </p>
                <p className="font-serif text-2xl text-[var(--c-fg)] mb-4">
                  {plan.name}
                </p>
                <div className="mb-6">
                  <span className="font-serif text-4xl md:text-5xl text-[var(--c-fg)]">
                    {plan.price}
                  </span>
                  <span className="font-sans text-sm text-[var(--c-fg)] opacity-70 ml-2">
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-6 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 font-sans text-sm text-[var(--c-fg)] opacity-80">
                      <Check className="w-4 h-4 text-[var(--c-accent)] flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <p className="font-sans text-xs text-[var(--c-fg)] opacity-60 mb-4">
                  {plan.recommendation}
                </p>
                <Button
                  variant={plan.isFeatured ? 'primary' : 'ghost'}
                  href="/signup"
                >
                  14 日間、無料で試す
                </Button>
              </Card>
            </div>
          </FadeUp>
        ))}
      </div>
      <div className="mt-10 max-w-3xl mx-auto">
        <ul className="space-y-1 font-mono text-xs opacity-60">
          {notes.map((note, i) => (
            <li key={i}>※ {note}</li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
