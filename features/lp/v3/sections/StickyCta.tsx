'use client';

import Icon from '@/features/lp/v3/components/Icon';

type Props = {
  onCta?: () => void;
};

export default function StickyCta({ onCta }: Props) {
  return (
    <div className="sticky-cta">
      <button className="btn btn-ghost" onClick={onCta}>
        <span className="btn-line-icon">L</span>LINE相談
      </button>
      <button className="btn btn-primary" onClick={onCta}>
        無料ではじめる <Icon name="arrowRight" size={14} />
      </button>
    </div>
  );
}
