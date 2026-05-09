'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';

function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.15) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current || seen) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, seen, threshold]);
  return seen;
}

type Props = {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
};

export default function FadeUp({ children, delay = 0, className = '', style }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, 0.1);
  return (
    <div
      ref={ref}
      className={`fade-up ${seen ? 'in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}
