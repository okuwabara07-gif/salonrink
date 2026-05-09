import React from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  lede?: string;
  className?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  lede,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`text-center mb-12 ${className}`}>
      {eyebrow && (
        <div className="font-cormorant text-sm font-bold tracking-widest uppercase text-[var(--c-fg-3)] mb-3">
          {eyebrow}
        </div>
      )}
      <h2 className="font-serif text-[clamp(26px,5.4vw,44px)] font-medium leading-[1.45] text-[var(--c-fg)] mb-4">
        {title}
      </h2>
      {lede && (
        <p className="text-[clamp(14px,2.1vw,16px)] leading-[1.95] text-[var(--c-fg-3)] max-w-2xl mx-auto">
          {lede}
        </p>
      )}
    </div>
  );
}
