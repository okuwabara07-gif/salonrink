'use client';

import FadeUp from '@/features/lp/v3/components/FadeUp';

type Props = {
  onCta?: () => void;
};

export default function LeadBanner({ onCta }: Props) {
  return (
    <section className="section section-soft">
      <div className="container">
        <FadeUp>
          <div className="lead-banner">
            <div>
              <div className="eyebrow" style={{ color: 'var(--c-bg)', opacity: 0.6 }}>FREE RESOURCES</div>
              <h3 style={{ marginTop: 12 }}>
                サービス紹介資料 & <br />
                個別オンライン説明会、承ります。
              </h3>
              <p style={{ color: 'var(--c-fg-4)', fontSize: 13, lineHeight: 1.85, marginTop: 14 }}>
                機能・料金・導入の流れをまとめたサービス紹介資料を無料でお送りします。ご希望に応じて、個別のオンライン説明会も承っております。
              </p>
            </div>
            <div className="lead-banner-actions">
              <button className="btn btn-primary btn-lg" onClick={onCta}>
                📄 資料を無料で受け取る
              </button>
              <button className="btn btn-ghost btn-lg" onClick={onCta}>
                📅 個別説明会を申し込む
              </button>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
