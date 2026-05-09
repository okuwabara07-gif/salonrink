import React from 'react';
import Section from './Section';
import SectionHeader from './SectionHeader';
import FadeUp from './FadeUp';

const rows = [
  { label: '主な役割', traditional: '予約の受付・管理', salonrink: '予約管理 + AI カルテ + 顧客育成' },
  { label: 'カウンセリング記録', traditional: 'スタイリスト個人による手動入力', salonrink: 'LINE 経由でお客様自身が事前入力' },
  { label: 'カルテ作成', traditional: '別ツールが必要、または非対応', salonrink: 'AI が自動構造化、標準搭載' },
  { label: 'LINE 連携', traditional: '予約通知の送信のみ', salonrink: '予約・記録・フォローまで完結' },
  { label: 'アレルギー警告', traditional: '手動入力・参照', salonrink: '予約時に自動表示' },
  { label: '次回来店時期の提案', traditional: 'スタッフの記憶頼み', salonrink: 'AI が来店周期を学習' },
  { label: 'スタッフ間共有', traditional: '手動引き継ぎ', salonrink: 'リアルタイム自動' },
  { label: '月額(基本機能)', traditional: 'サービスにより異なる', salonrink: '¥1,980 から' },
];

export default function Compare() {
  return (
    <Section className="bg-[var(--c-bg)]">
      <SectionHeader title="予約管理だけでは、終わらせない。" />

      <div className="hidden md:block max-w-5xl mx-auto">
        <FadeUp>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left font-mono text-xs uppercase tracking-wider opacity-60 py-4 px-4 border-b border-[var(--c-border-2)] w-1/4">
                  項目
                </th>
                <th className="text-left font-sans text-sm font-semibold py-4 px-4 border-b border-[var(--c-border-2)]">
                  従来の予約管理ツール
                </th>
                <th className="text-left font-sans text-sm font-semibold py-4 px-4 border-b-2 border-[var(--c-accent)] bg-[var(--c-bg-2)]">
                  SalonRink
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td className="font-mono text-xs uppercase tracking-wider opacity-60 py-4 px-4 border-b border-[var(--c-border-2)]">
                    {row.label}
                  </td>
                  <td className="font-sans text-sm py-4 px-4 border-b border-[var(--c-border-2)] opacity-70">
                    {row.traditional}
                  </td>
                  <td className="font-sans text-sm py-4 px-4 border-b border-[var(--c-border-2)] bg-[var(--c-bg-2)]">
                    {row.salonrink}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </FadeUp>
      </div>

      <div className="md:hidden space-y-4">
        {rows.map((row, index) => (
          <FadeUp key={index} delay={index * 40}>
            <div className="bg-[var(--c-bg-2)] border border-[var(--c-border-2)] rounded-lg p-4">
              <p className="font-mono text-xs uppercase tracking-wider opacity-60 mb-3">
                {row.label}
              </p>
              <div className="space-y-3">
                <div>
                  <p className="font-mono text-xs opacity-50 mb-1">従来</p>
                  <p className="font-sans text-sm opacity-70">{row.traditional}</p>
                </div>
                <div className="border-l-2 border-[var(--c-accent)] pl-3">
                  <p className="font-mono text-xs text-[var(--c-accent)] mb-1">SalonRink</p>
                  <p className="font-sans text-sm">{row.salonrink}</p>
                </div>
              </div>
            </div>
          </FadeUp>
        ))}
      </div>

      <p className="font-mono text-xs opacity-60 text-center mt-8 max-w-2xl mx-auto">
        ※ 「従来の予約管理ツール」の特徴は一般的な傾向を記述しており、特定のサービスを指すものではありません。
      </p>
    </Section>
  );
}
