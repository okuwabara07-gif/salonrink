'use client';

import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';

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
              <video controls playsInline preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit', display: 'block' }}>
                <source src="/v3/video-tour.mp4" type="video/mp4" />
              </video>
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
