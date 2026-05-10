'use client';

import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';

const COMPARE_ROWS = [
  ['AIカルテ自動生成', true, false, false],
  ['LINEカウンセリング', true, false, true],
  ['敏感肌情報の整理', true, false, false],
  ['予約・売上の一元管理', true, true, false],
  ['初期費用', '0円', '30,000円〜', '0円'],
  ['最短契約期間', 'なし', '12ヶ月', 'なし'],
  ['月額(標準プラン)', '¥1,980〜(税込¥2,178〜)', '¥9,800(税込¥10,780)', '¥4,500(税込¥4,950)'],
];

function Cell({ v }: { v: any }) {
  if (v === true) return <Icon name="check" size={18} stroke={2.4} />;
  if (v === false) return <span style={{ color: 'var(--c-fg-4)' }}>—</span>;
  return <span style={{ fontWeight: 600 }}>{v}</span>;
}

export default function CompareSection() {
  return (
    <section className="section section-cream">
      <div className="container">
        <FadeUp>
          <div className="eyebrow" style={{ textAlign: 'center', display: 'block' }}>COMPARE</div>
        </FadeUp>
        <FadeUp delay={80}>
          <h2 className="h2" style={{ marginTop: 14, textAlign: 'center' }}>
            他社サービスとの比較
          </h2>
        </FadeUp>
        <FadeUp delay={140}>
          <div style={{ marginTop: 36, overflowX: 'auto' }}>
            <table className="compare-table">
              <thead>
                <tr>
                  <th></th>
                  <th className="col-ours">SalonRink</th>
                  <th>従来型A社</th>
                  <th>予約系B社</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, i) => (
                  <tr key={i}>
                    <td>{row[0]}</td>
                    <td className="col-ours"><Cell v={row[1]} /></td>
                    <td><Cell v={row[2]} /></td>
                    <td><Cell v={row[3]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="compare-footnote">
            ※ 他社情報は公開情報をもとにした参考値です。プラン構成は各社の改定の可能性があります。<br />
            ※ SalonRink の月額は Light プランの料金です。Standard ¥2,980 / Premium ¥4,580 もご用意しています。
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
