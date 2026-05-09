'use client';

import { useRef, useState, useEffect } from 'react';

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
  value: number;
  suffix?: string;
};

export default function AnimatedNum({ value, suffix = '' }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!seen) return;
    const start = performance.now();
    let raf: number;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 1400);
      setN(value * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, value]);

  const display = Number.isInteger(value) ? Math.round(n).toLocaleString() : n.toFixed(1);
  return (
    <span ref={ref} className="num">
      {display}
      {suffix}
    </span>
  );
}
