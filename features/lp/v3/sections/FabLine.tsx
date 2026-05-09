'use client';

import Icon from '@/features/lp/v3/components/Icon';

type Props = {
  onCta?: () => void;
};

export default function FabLine({ onCta }: Props) {
  return (
    <button className="fab" onClick={onCta} aria-label="LINE">
      <Icon name="line" size={28} />
    </button>
  );
}
