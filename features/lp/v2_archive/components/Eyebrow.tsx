import React from 'react';

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
  as?: 'span' | 'div';
}

export default function Eyebrow({
  children,
  className = '',
  as: Component = 'span',
}: EyebrowProps) {
  return (
    <Component className={`font-cormorant text-[13px] font-bold tracking-[0.32em] uppercase text-[var(--c-fg)] ${className}`}>
      {children}
    </Component>
  );
}
