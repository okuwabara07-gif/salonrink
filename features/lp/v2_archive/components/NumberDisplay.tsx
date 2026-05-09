import React from 'react';

interface NumberDisplayProps {
  number: number | string;
  suffix?: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'text-[clamp(28px,6vw,48px)]',
  md: 'text-[clamp(36px,8vw,64px)]',
  lg: 'text-[clamp(48px,10vw,84px)]',
};

export default function NumberDisplay({
  number,
  suffix,
  label,
  className = '',
  size = 'md',
}: NumberDisplayProps) {
  return (
    <div className={`text-center ${className}`}>
      <div className={`font-cormorant ${sizeMap[size]} font-medium leading-tight text-[var(--c-accent-2)] mb-2`}>
        {number}
        {suffix && <span className="text-[0.6em]">{suffix}</span>}
      </div>
      {label && (
        <p className="text-sm text-[var(--c-fg-3)]">{label}</p>
      )}
    </div>
  );
}
