'use client';

import React from 'react';

interface CardProps {
  title?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  pad?: boolean;
  className?: string;
}

export function Card({ title, action, children, pad = true, className = '' }: CardProps) {
  return (
    <section className={`srk-card ${className}`}>
      {(title || action) && (
        <header className="srk-card-h">
          {title && <h3>{title}</h3>}
          {action}
        </header>
      )}
      <div className={`srk-card-b ${pad ? '' : 'nopad'}`}>{children}</div>
    </section>
  );
}
