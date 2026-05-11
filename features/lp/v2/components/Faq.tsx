'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import Section from './Section';
import SectionHeader from './SectionHeader';
import FadeUp from './FadeUp';

const faqItems = [
  {
    question: 'お試し期間中に解約できますか?',
    answer: 'はい、14 日間の無料期間中はいつでも解約いただけます。解約のお手続きはダッシュボードから 1 クリックで完了します。',
  },
  {
    question: '既存の HotPepper Beauty アカウントはそのまま使えますか?',
    answer: 'はい、Set B / Set C にて HotPepper Beauty 自動同期機能をご提供しています。お持ちのアカウントの ID とパスワードをご登録いただくことで、予約情報が自動的に同期されます。',
  },
  {
    question: '既存の LINE 公式アカウントを利用できますか?',
    answer: 'はい、お持ちの LINE 公式アカウントをそのまま接続いただけます。新規開設をご希望の場合は、設定代行(¥5,000)もご用意しています。',
  },
  {
    question: 'お客様には新しいアプリのインストールをお願いする必要がありますか?',
    answer: 'いいえ。お客様は普段ご利用の LINE のみで、予約・カウンセリング・フォローまで完結します。サロン様の手間も、お客様の手間も最小限です。',
  },
  {
    question: '複数店舗で利用する場合の料金体系は?',
    answer: 'Set C(¥4,580/月)が複数店舗・チーム運用向けです。3 店舗以上の場合は別途ご相談ください。お問い合わせは support@salonrink.com まで。',
  },
  {
    question: 'AI カルテのデータは他のサロン様と共有されますか?',
    answer: 'いいえ、データはサロン様ごとに完全に分離されています(Row Level Security)。他のサロン様から閲覧されることはありません。AI 学習用途への流用も行いません。',
  },
  {
    question: 'データのバックアップやエクスポートは可能ですか?',
    answer: 'はい、いつでもダッシュボードから全データをエクスポート可能です。退会時にも、お預けいただいたデータをすべてお引き渡しいたします。',
  },
  {
    question: '解約後のデータはどうなりますか?',
    answer: '解約から 90 日以内にエクスポートをお願いしております。90 日経過後は完全削除いたします(法令で保存義務があるものを除く)。',
  },
  {
    question: '法人(株式会社・合同会社)でも個人事業主でも申し込めますか?',
    answer: 'はい、どちらでもお申し込みいただけます。請求書発行も可能です。',
  },
  {
    question: '開発中の機能(Minimo 連携、Advanced AI)はいつ提供されますか?',
    answer: '提供開始時には Set C 加入の方には自動的に有効化されます。具体的な提供時期は、開発状況により順次ご案内いたします。',
  },
];

export default function Faq() {
  return (
    <Section className="bg-[var(--c-bg-2)]">
      <SectionHeader title="よくあるご質問。" />
      <FadeUp>
        <div className="max-w-3xl mx-auto">
          {faqItems.map((item, index) => (
            <details key={index} className="border-b border-[var(--c-border-2)]">
              <summary className="cursor-pointer py-5 flex items-center justify-between gap-4 font-serif text-base md:text-lg text-[var(--c-fg)] list-none">
                {item.question}
                <ChevronDown className="w-5 h-5 text-[var(--c-accent)] flex-shrink-0" />
              </summary>
              <div className="py-2 pb-5 font-sans text-sm md:text-base leading-relaxed text-[var(--c-fg)] opacity-80">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </FadeUp>
    </Section>
  );
}
