'use client';

import React, { useState, useMemo } from 'react';
import Section from './Section';
import SectionHeader from './SectionHeader';
import FadeUp from './FadeUp';

const plans = [
  { name: 'Set A', price: 2780 },
  { name: 'Set B', price: 2980 },
  { name: 'Set C', price: 4580 },
];

export default function RoiCalculator() {
  const [bookings, setBookings] = useState(100);
  const [unitPrice, setUnitPrice] = useState(6000);
  const [responseMinutes, setResponseMinutes] = useState(5);
  const [repeatLift, setRepeatLift] = useState(5);
  const [hourlyWage, setHourlyWage] = useState(1500);
  const [planIndex, setPlanIndex] = useState(1);

  const result = useMemo(() => {
    const aiAssistRate = 0.7;
    const timeSavedHours = (bookings * responseMinutes * aiAssistRate) / 60;
    const timeSavedYen = Math.round(timeSavedHours * hourlyWage);
    const repeatRevenue = Math.round(bookings * unitPrice * (repeatLift / 100));
    const totalRevenue = timeSavedYen + repeatRevenue;
    const planCost = plans[planIndex].price;
    const netImprovement = totalRevenue - planCost;
    return { timeSavedHours, timeSavedYen, repeatRevenue, totalRevenue, planCost, netImprovement };
  }, [bookings, unitPrice, responseMinutes, repeatLift, hourlyWage, planIndex]);

  const inputCls = 'w-full px-3 py-2 bg-[var(--c-bg)] border border-[var(--c-border-2)] rounded font-sans text-base text-[var(--c-fg)]';
  const labelCls = 'font-mono text-xs uppercase tracking-wider opacity-60 block mb-2';

  return (
    <Section className="bg-[var(--c-bg)]">
      <SectionHeader title="あなたのサロンで、どのくらい?" />

      <div className="max-w-4xl mx-auto mb-8 p-4 bg-[var(--c-bg-2)] border-l-2 border-[var(--c-accent)]">
        <p className="font-mono text-xs opacity-80 leading-relaxed">
          ※ 以下はあくまで概算試算ツールです。入力値や AI 代替率(想定 70%)、リピート率向上は仮定値であり、実際の運用結果を約束するものではありません。
        </p>
      </div>

      <FadeUp>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 max-w-5xl mx-auto">
          <div className="space-y-5 p-6 bg-[var(--c-bg-2)] border border-[var(--c-border-2)] rounded-lg">
            <p className="font-serif text-xl text-[var(--c-fg)] mb-4">あなたのサロンの状況</p>

            <div>
              <label className={labelCls}>月間予約件数</label>
              <input type="number" value={bookings} onChange={(e) => setBookings(Math.max(0, Number(e.target.value)))} className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>客単価(円)</label>
              <input type="number" value={unitPrice} onChange={(e) => setUnitPrice(Math.max(0, Number(e.target.value)))} className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>1 件あたり対応時間(分)</label>
              <input type="number" value={responseMinutes} onChange={(e) => setResponseMinutes(Math.max(0, Number(e.target.value)))} className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>リピート率向上(想定 %)</label>
              <input type="number" value={repeatLift} onChange={(e) => setRepeatLift(Math.max(0, Number(e.target.value)))} className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>スタッフ時給(円)</label>
              <input type="number" value={hourlyWage} onChange={(e) => setHourlyWage(Math.max(0, Number(e.target.value)))} className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>プラン</label>
              <select value={planIndex} onChange={(e) => setPlanIndex(Number(e.target.value))} className={inputCls}>
                {plans.map((p, i) => (
                  <option key={i} value={i}>
                    {p.name}(¥{p.price.toLocaleString()} / 月)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-5 p-6 bg-[var(--c-bg-2)] border-2 border-[var(--c-accent)] rounded-lg">
            <p className="font-serif text-xl text-[var(--c-fg)] mb-4">想定される月間改善(参考値)</p>

            <div>
              <p className={labelCls}>対応時間削減</p>
              <p className="font-serif text-2xl text-[var(--c-fg)]">月 {result.timeSavedHours.toFixed(1)} 時間</p>
              <p className="font-sans text-sm opacity-70">≒ ¥{result.timeSavedYen.toLocaleString()} 相当</p>
            </div>

            <div>
              <p className={labelCls}>リピート想定収益</p>
              <p className="font-serif text-2xl text-[var(--c-fg)]">¥{result.repeatRevenue.toLocaleString()}</p>
            </div>

            <div className="pt-4 border-t border-[var(--c-border-2)]">
              <p className={labelCls}>想定追加価値合計</p>
              <p className="font-serif text-3xl text-[var(--c-accent)]">¥{result.totalRevenue.toLocaleString()} / 月</p>
            </div>

            <div className="pt-4 border-t border-[var(--c-border-2)]">
              <p className={labelCls}>プラン費用差引後(参考)</p>
              <p className={`font-serif text-2xl ${result.netImprovement >= 0 ? 'text-[var(--c-fg)]' : 'opacity-60'}`}>
                ¥{result.netImprovement.toLocaleString()} / 月
              </p>
              <p className="font-mono text-xs opacity-50 mt-1">プラン費用 ¥{result.planCost.toLocaleString()} を差引</p>
            </div>
          </div>
        </div>
      </FadeUp>

      <div className="max-w-3xl mx-auto mt-8 space-y-1">
        <p className="font-mono text-xs opacity-60">
          ※ 「対応時間削減」は AI が予約・カウンセリング対応の 70% を代替する想定で算出。実際の代替率は運用環境により異なります。
        </p>
        <p className="font-mono text-xs opacity-60">
          ※ 「リピート想定収益」はご入力いただいたリピート率向上の仮定値に基づく試算で、実際の集客結果を約束するものではありません。
        </p>
        <p className="font-mono text-xs opacity-60">
          ※ 上記の数値は参考値であり、実際のサロン運用結果を約束または示唆するものではありません。
        </p>
      </div>
    </Section>
  );
}
