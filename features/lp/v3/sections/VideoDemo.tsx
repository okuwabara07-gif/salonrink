'use client';

import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';
import ImageSlot from '@/features/lp/v3/components/ImageSlot';

type Props = {
  onCta?: () => void;
};

export default function VideoDemo({ onCta }: Props) {
  return (
    <section className="section section-cream">
      <div className="container">
        <FadeUp>
          <div className="eyebrow" style={{ textAlign: 'center', display: 'block' }}>VIDEO TOUR</div>
        </FadeUp>
        <FadeUp delay={80}>
          <h2 className="h2" style={{ marginTop: 14, textAlign: 'center' }}>
            90秒で分かる、SalonRink。
          </h2>
        </FadeUp>
        <FadeUp delay={140}>
          <div style={{ marginTop: 36, maxWidth: 980, margin: '36px auto 0' }}>
            <div className="video-frame">
              <ImageSlot id="video-poster" placeholder="プロダクトの動画サムネイル: ダッシュボードのフルスクリーン" />
              <div className="video-play">
                <div className="video-play-btn">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <div className="video-meta">▶ 1:32  プロダクトツアー</div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button className="btn btn-ghost" onClick={onCta}>
                担当者によるオンラインデモを予約 <Icon name="arrowRight" size={14} />
              </button>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
