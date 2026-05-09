'use client';

import React from 'react';
import { Lock, ShieldCheck, KeyRound, HardDrive, UserMinus, MessageCircle } from 'lucide-react';
import Section from './Section';
import SectionHeader from './SectionHeader';
import Card from './Card';
import FadeUp from './FadeUp';

const trustCards = [
  {
    icon: Lock,
    title: 'お客様の情報は、サロンのもの。',
    description: 'SalonRink が代わりに保管しますが、データの所有権はサロン様にあります。退会時には全データのエクスポートが可能です。',
  },
  {
    icon: ShieldCheck,
    title: '通信と保管、両方を暗号化。',
    description: 'TLS 1.3 による通信暗号化、保管時の AES-256 暗号化。HotPepper Beauty ログイン情報など機密データは個別キーで保護しています。',
  },
  {
    icon: KeyRound,
    title: 'サロンごとの厳格な分離。',
    description: 'データベースレベルで salon_id による分離(Row Level Security)。他のサロン様の情報が見えることがない設計です。',
  },
  {
    icon: HardDrive,
    title: '自動バックアップ。',
    description: '毎日のスナップショットと、東京リージョン内での冗長保存。',
  },
  {
    icon: UserMinus,
    title: 'お客様の個人情報を、必要最小限に。',
    description: '必要最小限の情報のみを取得します。カウンセリング内容は AI カルテ生成に使用しますが、外部の AI 学習用途への流用は行いません。',
  },
  {
    icon: MessageCircle,
    title: 'メール対応の目安、24 時間以内。',
    description: 'support@salonrink.com にて、平日 24 時間以内の返信を目安としています。',
  },
];

export default function Trust() {
  return (
    <Section className="bg-[var(--c-bg)]">
      <SectionHeader title="お預かりするデータの、扱いについて。" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trustCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <FadeUp key={index} delay={index * 80}>
              <Card className="bg-[var(--c-bg-2)] border-[var(--c-border-2)]">
                <Icon className="w-8 h-8 text-[var(--c-accent)] mb-4" />
                <h3 className="font-serif text-lg md:text-xl text-[var(--c-fg)] mb-3">
                  {card.title}
                </h3>
                <p className="font-sans text-sm md:text-base leading-relaxed text-[var(--c-fg)] opacity-80">
                  {card.description}
                </p>
              </Card>
            </FadeUp>
          );
        })}
      </div>
      <div className="mt-8 text-center">
        <p className="font-mono text-xs opacity-60">
          ※ 上記の対応時間目安は当社内基準に基づくものです。状況により変動する場合があります。
        </p>
      </div>
    </Section>
  );
}
