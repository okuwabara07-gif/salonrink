import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  radius?: 'md' | 'lg' | 'xl';
}

const radiusMap = {
  md: 'rounded-[var(--r-md)]',
  lg: 'rounded-[var(--r-lg)]',
  xl: 'rounded-[var(--r-xl)]',
};

export default function Card({
  children,
  className = '',
  as: Component = 'div',
  radius = 'xl',
}: CardProps) {
  return (
    <Component
      className={`bg-[var(--c-bg-card)] border border-[var(--c-border)] p-6 ${radiusMap[radius]} ${className}`}
    >
      {children}
    </Component>
  );
}
