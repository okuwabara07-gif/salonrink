'use client';

import FadeUp from '@/features/lp/v3/components/FadeUp';
import AnimatedNum from '@/features/lp/v3/components/AnimatedNum';
import ImageSlot from '@/features/lp/v3/components/ImageSlot';

export default function DashboardSection() {
  return (
    <section className="section section-soft">
      <div className="container">
        <div className="split">
          <FadeUp>
            <div className="split-img">
              <ImageSlot id="dash-img" placeholder="ノートPCを見ながら経営判断する美容師オーナーの写真" />
            </div>
          </FadeUp>
          <FadeUp delay={120}>
            <div>
              <div className="eyebrow">03 / Operations</div>
              <h2 className="h2" style={{ marginTop: 16 }}>
                数字で見る、<br />
                <span className="underline-accent">サロンの今</span>。
              </h2>
              <p className="lede" style={{ marginTop: 18 }}>
                売上・予約・指名・客単価をリアルタイムに可視化。経営判断のスピードが変わります。
              </p>
              <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { v: 75, s: '%', l: '予約管理時間 削減' },
                  { v: 2.3, s: 'x', l: 'リピート率 向上' },
                  { v: 14, s: '日', l: '無料トライアル' },
                ].map((k, i) => (
                  <div key={i}>
                    <div className="kpi-num" style={{ fontSize: 44 }}>
                      <AnimatedNum value={k.v} />
                      <small>{k.s}</small>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--c-fg-3)', marginTop: 4 }}>{k.l}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--c-fg-3)', marginTop: 20, lineHeight: 1.7 }}>
                ※ 運用実績に基づくモデル値です（参考値）
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
