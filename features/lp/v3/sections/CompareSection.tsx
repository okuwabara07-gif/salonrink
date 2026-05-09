'use client';

import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';

const COMPARE_ROWS = [
  ['AIカルテ自動生成', true, false, false],
  ['LINE LIFFカウンセリング', true, false, true],
  ['敏感肌情報の整理', true, false, false],
  ['予約・売上の一元管理', true, true, false],
  ['初期費用', '0円', '30,000円〜', '0円'],
  ['最短契約期間', 'なし', '12ヶ月', 'なし'],
  ['月額（標準プラン）', '¥1,980', '¥9,800', '¥4,500'],
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
          <div className="compare-wrap" style={{ marginTop: 36, overflowX: 'auto' }}>
            <table className="compare-table">
              <thead>
                <tr>
                  <th></th>
                  <th className="ours-col">SalonRink</th>
                  <th>従来型A社</th>
                  <th>予約系B社</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, i) => (
                  <tr key={i}>
                    <td>{row[0]}</td>
                    <td className="ours-col"><Cell v={row[1]} /></td>
                    <td><Cell v={row[2]} /></td>
                    <td><Cell v={row[3]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ marginTop: 16, fontSize: 11, color: 'var(--c-fg-4)', textAlign: 'center', lineHeight: 1.7 }}>
              ※ 他社情報は公開情報をもとにした参考値です。プラン構成は各社の改定可能性があります。
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
