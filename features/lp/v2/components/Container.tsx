import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`w-full max-w-[var(--max-w)] mx-auto px-[var(--pad-x)] ${className}`}>
      {children}
    </div>
  );
}
