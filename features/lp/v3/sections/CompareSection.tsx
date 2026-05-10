'use client';

import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';

const COMPARE_ROWS = [
  {
    label: 'AIカルテ自動生成',
    sublabel: 'AIが会話内容をもとに自動でカルテを作成',
    icon: 'brain',
    type: 'feature',
    sr: { type: 'ok', value: '対応', note: 'AIが自動で生成し、整理・要約まで対応' },
    a: { type: 'ng', value: '未対応', note: '手動での入力が必要' },
    b: { type: 'ng', value: '未対応', note: '手動での入力が必要' },
  },
  {
    label: 'LINEカウンセリング',
    sublabel: 'LINE上で事前カウンセリングが完結',
    icon: 'chat',
    type: 'feature',
    sr: { type: 'ok', value: '対応', note: 'LINE上で完結。離脱なくスムーズ' },
    a: { type: 'ng', value: '未対応', note: '独自フォームなどでの対応' },
    b: { type: 'ok', value: '対応', note: 'LINE連携は可能' },
  },
  {
    label: '敏感肌情報の整理',
    sublabel: '肌・髪の状態や履歴を自動で整理',
    icon: 'folder',
    type: 'feature',
    sr: { type: 'ok', value: '対応', note: '肌・髪の履歴を自動で整理・蓄積' },
    a: { type: 'ng', value: '未対応', note: '情報の整理は手動で対応' },
    b: { type: 'ng', value: '未対応', note: '情報の整理は手動で対応' },
  },
  {
    label: '予約・売上の一元管理',
    sublabel: '予約から売上分析まで一元で管理',
    icon: 'chart',
    type: 'feature',
    sr: { type: 'ok', value: '対応', note: '予約・売上・顧客情報を一元管理' },
    a: { type: 'ok', value: '対応', note: '基本的な管理は可能' },
    b: { type: 'ng', value: '未対応', note: '予約管理のみ対応' },
  },
  {
    label: '初期費用',
    icon: 'card',
    type: 'price',
    sr: { value: '0円' },
    a: { value: '30,000円〜' },
    b: { value: '0円' },
  },
  {
    label: '最短契約期間',
    icon: 'calendar',
    type: 'price',
    sr: { value: 'なし' },
    a: { value: '12ヶ月' },
    b: { value: 'なし' },
  },
  {
    label: '月額(標準プラン)',
    icon: 'card',
    type: 'price',
    sr: { value: '¥1,980〜', note: '(税込¥2,178〜)' },
    a: { value: '¥9,800', note: '(税込¥10,780)' },
    b: { value: '¥4,500', note: '(税込¥4,950)' },
  },
];

function CompareCell({ cell, type }: { cell: any; type: string }) {
  if (type === 'price') {
    return (
      <div>
        <div className="compare-cell-value">{cell.value}</div>
        {cell.note && <div className="compare-cell-note">{cell.note}</div>}
      </div>
    );
  }
  // feature 行
  return (
    <div>
      {cell.type === 'ok' ? (
        <span className="compare-cell-ok-badge">
          <Icon name="check" size={16} />
        </span>
      ) : (
        <span className="compare-cell-ng-badge">
          <Icon name="x" size={16} />
        </span>
      )}
      <div className="compare-cell-value">{cell.value}</div>
      {cell.note && <div className="compare-cell-note">{cell.note}</div>}
    </div>
  );
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
                    <td className="compare-row-label">
                      <Icon name={row.icon as any} size={20} />
                      <div>
                        <div className="compare-row-title">{row.label}</div>
                        {row.sublabel && (
                          <div className="compare-row-sub">{row.sublabel}</div>
                        )}
                      </div>
                    </td>
                    <td className="col-ours">
                      <CompareCell cell={row.sr} type={row.type} />
                    </td>
                    <td>
                      <CompareCell cell={row.a} type={row.type} />
                    </td>
                    <td>
                      <CompareCell cell={row.b} type={row.type} />
                    </td>
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
