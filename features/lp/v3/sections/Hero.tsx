'use client';

import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';

type Props = {
  onCta?: () => void;
};

export default function Hero({ onCta }: Props) {
  return (
    <section
      id="top"
      style={{
        position: 'relative',
        minHeight: '88vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 0',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      {/* 背景画像 + グラデーションマスク */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <img
          src="/v3/hero-main.png"
          alt="サロンで美容師とお客様がタブレットを見ている"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
        {/* 上下グラデーション(クリーム → 透明 → クリーム) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, var(--c-bg) 0%, rgba(250, 246, 241, 0.45) 22%, rgba(250, 246, 241, 0.78) 65%, var(--c-bg) 100%)',
          }}
        />
      </div>

      {/* 中央配置コンテンツ */}
      <div className="container" style={{ position: 'relative', zIndex: 2, maxWidth: 760 }}>
        <FadeUp>
          <div className="eyebrow" style={{ display: 'block', marginBottom: 18 }}>
            AI × CARTE × LINE
          </div>
          <h1 className="h1" style={{ marginTop: 0 }}>
            <span>いつもの、</span>
            <br />
            <span>その先へ。</span>
          </h1>
          <p className="lede" style={{ marginTop: 22, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
            LINEで完結するAIカルテで、サロンワークをもっと安心・スマートに。
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
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
          <div style={{ display: 'flex', gap: 10, marginTop: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-primary btn-lg" onClick={onCta}>
              <span className="btn-line-icon">L</span> LINEでデモを見る <Icon name="arrowRight" size={14} />
            </button>
            <button className="btn btn-ghost btn-lg">14日間無料で試す</button>
          </div>
          <div style={{ marginTop: 18, fontSize: 12, color: 'var(--c-fg-3)' }}>
            クレジットカード不要・14日間無料トライアル
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
