'use client';

import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';

const FEATS = [
  { i: 'brain', t: 'AIカルテ自動生成', d: '回答からAIが構造化' },
  { i: 'chat', t: 'LIFFカウンセリング', d: '事前回答で時短' },
  { i: 'shield', t: '事前カウンセリング管理', d: '情報を自動構造化' },
  { i: 'calendar', t: '予約管理', d: 'ダブルブッキング防止' },
  { i: 'chart', t: '売上ダッシュボード', d: 'リアルタイム可視化' },
  { i: 'folder', t: '顧客履歴一元管理', d: '写真・好みも保存' },
  { i: 'spark', t: 'AIメニュー提案', d: '次回最適化サジェスト' },
  { i: 'card', t: 'オンライン決済', d: 'Stripe連携' },
  { i: 'lock', t: '権限管理', d: 'スタッフ別アクセス' },
  { i: 'menu', t: 'リマインド配信', d: 'LINE自動送信' },
  { i: 'star', t: '口コミ収集', d: 'Google連動' },
  { i: 'arrowRight', t: 'API連携', d: '他SaaSと接続' },
];

export default function FeatureGrid() {
  return (
    <section className="section section-cream">
      <div className="container">
        <FadeUp>
          <div className="eyebrow" style={{ textAlign: 'center', display: 'block' }}>FEATURES</div>
        </FadeUp>
        <FadeUp delay={80}>
          <h2 className="h2" style={{ marginTop: 14, textAlign: 'center' }}>
            サロン運営に必要な機能、<br />
            すべてが一つに。
          </h2>
        </FadeUp>
        <FadeUp delay={140}>
          <div className="feat-grid" style={{ marginTop: 40 }}>
            {FEATS.map((f, i) => (
              <div key={i} className="feat-cell">
                <span className="feat-cell-icon">
                  <Icon name={f.i as any} size={18} />
                </span>
                <div className="feat-cell-title">{f.t}</div>
                <div className="feat-cell-desc">{f.d}</div>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
