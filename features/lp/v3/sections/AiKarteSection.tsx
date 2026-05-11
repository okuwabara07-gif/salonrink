'use client';

import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';
import ImageSlot from '@/features/lp/v3/components/ImageSlot';

export default function AiKarteSection() {
  return (
    <section className="section section-soft">
      <div className="container">
        <div className="split">
          <FadeUp>
            <div className="split-img">
              <ImageSlot id="karte-img" placeholder="美容師がお客様のカルテを見ている" src="/v3/karte-img.png" alt="美容師がタブレットでお客様のカルテを確認" />
            </div>
          </FadeUp>
          <FadeUp delay={120}>
            <div>
              <div className="eyebrow">01 / AI Karte</div>
              <h2 className="h2" style={{ marginTop: 16 }}>
                AIがつくる、<br />
                <span className="underline-accent">あなただけのカルテ</span>。
              </h2>
              <p className="lede" style={{ marginTop: 18 }}>
                事前カウンセリングからAIが自動解析。リスクの見落としを防ぎ、最適な提案で顧客満足度を高めます。
              </p>
              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  '施術履歴・写真・好みを自動構造化',
                  '敏感肌情報を施術前に整理してご共有',
                  '次回来店時の最適メニューをサジェスト',
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
