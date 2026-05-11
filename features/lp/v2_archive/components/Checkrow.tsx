import React from 'react';

interface CheckrowProps {
  children: React.ReactNode;
  className?: string;
  iconColor?: string;
}

export default function Checkrow({
  children,
  className = '',
  iconColor = 'var(--c-accent)',
}: CheckrowProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        className="flex-shrink-0"
        style={{ color: iconColor }}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
      </svg>
      <span className="text-sm text-[var(--c-fg-3)]">{children}</span>
    </div>
  );
}
