'use client';

import { useState } from 'react';
import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';

const PLANS = [
  { name: 'Light', desc: 'シンプルに始めたいサロン向け', monthly: 1980, yearly: 1584, feats: ['AIカルテ・LINE連携', '予約管理・顧客管理', '前日リマインド自動配信', 'メールサポート'] },
  { name: 'Standard', desc: '売上を伸ばしたいサロン向け', monthly: 2980, yearly: 2384, featured: true, feats: ['Lightの全機能', 'AIカルテ自動生成・提案', 'ホットペッパー Beauty 連携', 'AI接客スクリプト', 'ケア事項お知らせ'] },
  { name: 'Premium', desc: '本格的に運用したいサロン向け', monthly: 4580, yearly: 3664, feats: ['Standardの全機能', '全機能フル装備', 'マルチ店舗管理対応', 'スタッフ無制限', '優先サポート'] },
];

type Props = {
  onCta?: () => void;
};

export default function PlansSection({ onCta }: Props) {
  const [yearly, setYearly] = useState(false);

  return (
    <section className="section section-soft" id="plans">
      <div className="container">
        <FadeUp>
          <div className="eyebrow" style={{ textAlign: 'center', display: 'block' }}>PLANS</div>
        </FadeUp>
        <FadeUp delay={80}>
          <h2 className="h2" style={{ marginTop: 14, textAlign: 'center' }}>
            規模にあわせて、選べる3プラン。
          </h2>
        </FadeUp>
        <FadeUp delay={140}>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <div className="plan-tabs">
              <button className={`plan-tab ${!yearly ? 'active' : ''}`} onClick={() => setYearly(false)}>月払い</button>
              <button className={`plan-tab ${yearly ? 'active' : ''}`} onClick={() => setYearly(true)}>年払い -20%</button>
            </div>
          </div>
        </FadeUp>
        <FadeUp delay={200}>
          <div className="plans-grid" style={{ marginTop: 24 }}>
            {PLANS.map((p) => (
              <div key={p.name} className={`plan-card ${p.featured ? 'featured' : ''}`}>
                {p.featured && <div className="plan-badge">おすすめ</div>}
                <div>
                  <div className="plan-name">{p.name}</div>
                  <div className="plan-desc" style={{ marginTop: 6 }}>{p.desc}</div>
                </div>
                <div className="plan-price">
                  <span style={{ fontSize: 14, marginRight: 4 }}>¥</span>
                  <span className="num">{(yearly ? p.yearly : p.monthly).toLocaleString()}</span>
                  <span style={{ fontSize: 13, color: 'var(--c-fg-3)', marginLeft: 4 }}>/月（税込）</span>
                </div>
                <div className="plan-feats">
                  {p.feats.map((f) => (
                    <div key={f} className="plan-feat-row">
                      <span className="checkrow-dot" style={{ width: 16, height: 16, flexShrink: 0 }}>
                        <Icon name="check" size={10} stroke={2.6} />
                      </span>
                      {f}
                    </div>
                  ))}
                </div>
                <button className={`btn ${p.featured ? 'btn-primary' : 'btn-ghost'} btn-block`} onClick={onCta}>
                  {p.featured ? '無料ではじめる' : 'このプランを選ぶ'}
                </button>
              </div>
            ))}
          </div>
        </FadeUp>
        <FadeUp delay={260}>
          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--c-fg-3)' }}>
            すべてのプランに14日間無料トライアルが付帯。
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
