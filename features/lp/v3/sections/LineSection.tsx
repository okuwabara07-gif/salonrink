'use client';

import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';
import FullChatMock from '@/features/lp/v3/components/FullChatMock';

export default function LineSection() {
  return (
    <section className="section section-cream">
      <div className="container">
        <div className="split reverse">
          <FadeUp>
            <div className="split-img" style={{ background: 'var(--c-bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
              <div className="phone-frame">
                <div className="phone-screen" style={{ minHeight: 460 }}>
                  <FullChatMock />
                </div>
              </div>
            </div>
          </FadeUp>
          <FadeUp delay={120}>
            <div>
              <div className="eyebrow">02 / LINE LIFF</div>
              <h2 className="h2" style={{ marginTop: 16 }}>
                すべて<span className="underline-accent">LINEで完結</span>。<br />
                お客様もスタッフも、迷わない。
              </h2>
              <p className="lede" style={{ marginTop: 18 }}>
                事前カウンセリング・予約・リマインド・アフターケア。お客様は普段使うLINEから抜け出さずに完結します。
              </p>
              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'LIFF事前カウンセリング（来店前アンケート）',
                  '予約・変更・リマインドの自動配信',
                  'AI分析結果をその場でフィードバック',
                ].map((t) => (
                  <div key={t} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'var(--c-fg-2)' }}>
                    <span className="checkrow-dot" style={{ marginTop: 2 }}>
                      <Icon name="check" size={12} stroke={2.4} />
                    </span>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
