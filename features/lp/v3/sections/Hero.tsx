'use client';

import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';
import ChatMockMini from '@/features/lp/v3/components/ChatMockMini';
import ImageSlot from '@/features/lp/v3/components/ImageSlot';

type Props = {
  onCta?: () => void;
};

export default function Hero({ onCta }: Props) {
  return (
    <section className="hero" id="top">
      <div className="container">
        <div className="hero-grid">
          <FadeUp className="hero-text">
            <div className="eyebrow">AI × CARTE × LINE</div>
            <h1 className="h1" style={{ marginTop: 18 }}>
              <span>いつもの、</span>
              <br />
              <span>その先へ。</span>
            </h1>
            <p className="lede" style={{ marginTop: 22, maxWidth: 520 }}>
              LINEで完結するAIカルテで、サロンワークをもっと安心・スマートに。
            </p>
            <div style={{ display: 'flex', gap: 14, marginTop: 28, flexWrap: 'wrap' }}>
              <span className="checkrow">
                <span className="checkrow-dot">
                  <Icon name="check" size={12} stroke={2.4} />
                </span>
                初期費用 ¥3,000(SNS共有で無料)
              </span>
              <span className="checkrow">
                <span className="checkrow-dot">
                  <Icon name="check" size={12} stroke={2.4} />
                </span>
                最短契約期間 なし
              </span>
              <span className="checkrow">
                <span className="checkrow-dot">
                  <Icon name="check" size={12} stroke={2.4} />
                </span>
                LINEだけでスタート
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 28, flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={onCta}>
                <span className="btn-line-icon">L</span> LINEでデモを見る <Icon name="arrowRight" size={14} />
              </button>
              <button className="btn btn-ghost btn-lg">14日間無料で試す</button>
            </div>
            <div style={{ marginTop: 18, fontSize: 12, color: 'var(--c-fg-3)' }}>
              クレジットカード不要・14日間無料トライアル
            </div>
          </FadeUp>

          <FadeUp delay={140}>
            <div style={{ position: 'relative' }}>
              <div className="hero-image">
                <ImageSlot id="hero-main" placeholder="メインビジュアル: サロンで美容師とお客様がタブレットを見ている写真" src="/v3/hero-main.png" alt="サロンで美容師とお客様がタブレットを見ている" />
              </div>
              <div
                style={{
                  position: 'absolute',
                  right: -8,
                  top: 40,
                  width: '60%',
                  maxWidth: 240,
                  display: 'block',
                }}
                className="hero-chat-overlay"
              >
                <ChatMockMini />
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
