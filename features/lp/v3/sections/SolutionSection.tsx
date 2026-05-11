'use client';

import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';

const PILLARS = [
  { icon: 'brain', t: ['AIが質問・解析して', 'リスクを自動検出'] },
  { icon: 'folder', t: ['カルテを自動生成・', '履歴を一元管理'] },
  { icon: 'chart', t: ['再来店・売上に繋がる', 'リピート分析'] },
  { icon: 'lock', t: ['個人情報は安全に', '暗号化して保護'] },
];

export default function SolutionSection() {
  return (
    <section className="section section-cream" id="features">
      <div className="container">
        <FadeUp>
          <h2 className="h2" style={{ textAlign: 'center' }}>
            そのすべて、SalonRinkが<span className="accent">解決</span>します。
          </h2>
        </FadeUp>
        <div className="grid-4" style={{ marginTop: 48 }}>
          {PILLARS.map((p, i) => (
            <FadeUp key={i} delay={i * 80}>
              <div className="pillar">
                <span className="pillar-icon">
                  <Icon name={p.icon as any} size={26} />
                </span>
                <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.7 }}>
                  {p.t.map((l, j) => <div key={j}>{l}</div>)}
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
