import React from 'react';
import { Sun, Scissors, Heart } from 'lucide-react';
import Section from './Section';
import SectionHeader from './SectionHeader';
import Card from './Card';
import FadeUp from './FadeUp';

const scenes = [
  {
    icon: Sun,
    timeLabel: 'AM 9:00 / 開店前',
    title: '今日のお客様の顔が、すぐ浮かぶ。',
    description: '来店予定の方の前回のカウンセリング、好み、施術の傾向。スタッフ全員が、お客様の名前と一緒に思い出せる状態で 1 日が始まる。',
  },
  {
    icon: Scissors,
    timeLabel: 'PM 2:00 / 施術中',
    title: '会話に、集中できる。',
    description: '受付の電話も、予約変更の通知も、AI が代わりに対応している。目の前のお客様との会話に、心を傾けられる時間が増える。',
  },
  {
    icon: Heart,
    timeLabel: '翌週 / フォローアップ',
    title: '「また来てくださいね」が、自然に伝わる。',
    description: '次のお手入れの目安や、季節のご案内が、お客様一人ひとりのタイミングで届く。お礼の返信が、自然と返ってくる。',
  },
];

export default function Cases() {
  return (
    <Section className="bg-[var(--c-bg-2)]">
      <SectionHeader title="サロンに、こんな景色が戻ってくる。" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {scenes.map((scene, index) => {
          const Icon = scene.icon;
          return (
            <FadeUp key={index} delay={index * 100}>
              <Card className="h-full bg-[var(--c-bg)] border-[var(--c-border-2)] flex flex-col">
                <Icon className="w-8 h-8 text-[var(--c-accent)] mb-4" />
                <p className="font-mono text-xs uppercase tracking-wider opacity-60 mb-3">
                  {scene.timeLabel}
                </p>
                <h3 className="font-serif text-xl md:text-2xl text-[var(--c-fg)] mb-3 leading-tight">
                  {scene.title}
                </h3>
                <p className="font-sans text-sm md:text-base leading-relaxed text-[var(--c-fg)] opacity-80">
                  {scene.description}
                </p>
              </Card>
            </FadeUp>
          );
        })}
      </div>
      <p className="font-mono text-xs opacity-60 text-center mt-8 max-w-2xl mx-auto">
        ※ 上記はサービスの活用シーンの一例であり、特定の実績を示すものではありません。
      </p>
    </Section>
  );
}
