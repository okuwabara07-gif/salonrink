import React from 'react';
import Container from './Container';

interface SectionProps {
  id?: string;
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
}

export default function Section({
  id,
  as: Component = 'section',
  className = '',
  children,
}: SectionProps) {
  return (
    <Component
      id={id}
      className={`py-[var(--section-y)] ${className}`}
    >
      <Container>{children}</Container>
    </Component>
  );
}
