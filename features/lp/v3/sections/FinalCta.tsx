'use client';

import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';

type Props = {
  onCta?: () => void;
};

export default function FinalCta({ onCta }: Props) {
  return (
    <section className="section section-soft" style={{ paddingBottom: 120 }}>
      <div className="container" style={{ maxWidth: 760, textAlign: 'center' }}>
        <FadeUp>
          <div className="eyebrow">START FREE</div>
        </FadeUp>
        <FadeUp delay={80}>
          <h2 className="h2" style={{ marginTop: 16, fontSize: 'clamp(28px, 6vw, 48px)' }}>
            サロンの未来を、<br />
            いま、はじめる。
          </h2>
        </FadeUp>
        <FadeUp delay={140}>
          <p className="lede" style={{ marginTop: 18 }}>
            14日間の無料トライアル。クレジットカード不要・最短契約期間なし。
          </p>
        </FadeUp>
        <FadeUp delay={200}>
          <div style={{ display: 'flex', gap: 12, marginTop: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={onCta}>
              14日間無料で試す <Icon name="arrowRight" size={14} />
            </button>
            <button className="btn btn-ghost btn-lg" onClick={onCta}>
              <span className="btn-line-icon" style={{ background: '#06c755' }}>L</span> LINEで相談する
            </button>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
