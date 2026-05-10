'use client';

import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';

const COMPARE_ROWS = [
  ['AIカルテ自動生成', true, false, false],
  ['LINEカウンセリング', true, false, true],
  ['アレルギー注意表示', true, false, false],
  ['予約・売上一元管理', true, true, false],
  ['初期費用', '無料', '30,000円〜', '無料'],
  ['最短契約期間', 'なし', '12ヶ月', 'なし'],
  ['月額（スタンダード）', '¥1,980〜', '¥9,800', '¥4,500'],
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
            SalonRink vs 他社サービス
          </h2>
        </FadeUp>
        <FadeUp delay={140}>
          <div style={{ marginTop: 36, overflowX: 'auto' }}>
            <table className="compare-table">
              <thead>
                <tr>
                  <th></th>
                  <th className="col-ours">
                    SalonRink
                    <div className="compare-table-badge">最適化</div>
                  </th>
                  <th>従来型 A 社</th>
                  <th>予約系 B 社</th>
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
            ※ 他社情報は公開情報に基づく参考値です。<br />
            ※ 価格・機能は各社仕様変更の可能性があります。
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
