import React from 'react';
import { Sparkles, MessageCircle, RefreshCw, Mail, Wallet } from 'lucide-react';
import Section from './Section';
import SectionHeader from './SectionHeader';
import Card from './Card';
import FadeUp from './FadeUp';

const cells = [
  {
    icon: Sparkles,
    eyebrow: 'AI カルテ',
    title: 'お客様の「いつも」を、スタッフ全員で。',
    description: '過去のカウンセリング、施術内容、お客様の好み。AI が自動で構造化し、誰が担当しても同じ温度で迎えられます。',
    span: 'md:col-span-2 md:row-span-2',
    delay: 0,
    isLarge: true,
  },
  {
    icon: MessageCircle,
    eyebrow: 'LINE 連携',
    title: '新しいアプリは、いりません。',
    description: '予約も、カウンセリング前のヒアリングも、お客様が普段使っている LINE の中で。',
    span: '',
    delay: 80,
    isLarge: false,
  },
  {
    icon: RefreshCw,
    eyebrow: '履歴共有',
    title: 'あの時のお客様を、思い出せる。',
    description: '来店ごとに記録が積み重なり、次の予約時には一目で全員が把握できる状態に。',
    span: '',
    delay: 160,
    isLarge: false,
  },
  {
    icon: Mail,
    eyebrow: 'フォローアップ',
    title: '関係づくりは、来店の前後にもあります。',
    description: '次のお手入れの目安や、季節のご案内を、お客様一人ひとりのタイミングで。',
    span: 'md:col-span-2',
    delay: 240,
    isLarge: false,
  },
  {
    icon: Wallet,
    eyebrow: '月額',
    title: '¥1,980 から',
    description: '必要な機能だけ選んで使える、シンプルな料金体系。',
    span: '',
    delay: 320,
    isLarge: false,
  },
];

export default function Solution() {
  return (
    <Section className="bg-[var(--c-bg)]">
      <SectionHeader title="あなたのファンを、つくる場所。" />
      <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-3 gap-4 md:gap-6">
        {cells.map((cell, index) => {
          const Icon = cell.icon;
          return (
            <div key={index} className={cell.span}>
              <FadeUp delay={cell.delay}>
                <Card className="h-full bg-[var(--c-bg-2)] border-[var(--c-border-2)] flex flex-col">
                  <Icon className={`text-[var(--c-accent)] mb-4 ${cell.isLarge ? 'w-10 h-10' : 'w-7 h-7'}`} />
                  <p className="font-mono text-xs uppercase tracking-wider opacity-60 mb-2">
                    {cell.eyebrow}
                  </p>
                  <h3 className={`font-serif text-[var(--c-fg)] mb-3 leading-tight ${cell.isLarge ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'}`}>
                    {cell.title}
                  </h3>
                  <p className={`font-sans leading-relaxed text-[var(--c-fg)] opacity-80 ${cell.isLarge ? 'text-base md:text-lg' : 'text-sm md:text-base'}`}>
                    {cell.description}
                  </p>
                </Card>
              </FadeUp>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
