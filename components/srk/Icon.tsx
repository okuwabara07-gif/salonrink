'use client';

import React from 'react';

const PATHS: Record<string, string> = {
  home:     'M3 11l9-8 9 8M5 9.5V21h14V9.5',
  calendar: 'M3 7h18M7 3v4M17 3v4M5 7v13h14V7M9 12h2M13 12h2M9 16h2M13 16h2',
  users:    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  link:     'M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1',
  grid:     'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  bell:     'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9zM10 21a2 2 0 0 0 4 0',
  search:   'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  plus:     'M12 5v14M5 12h14',
  chev_r:   'M9 6l6 6-6 6',
  chev_l:   'M15 6l-6 6 6 6',
  chev_d:   'M6 9l6 6 6-6',
  dot3:     'M5 12h.01M12 12h.01M19 12h.01',
  spark:    'M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9z',
  arrow_ur: 'M7 17L17 7M9 7h8v8',
  arrow_dr: 'M7 7l10 10M9 17h8V9',
  arrow_r:  'M5 12h14M13 6l6 6-6 6',
  check:    'M5 12l4 4L19 7',
  msg:      'M21 11.5a8.4 8.4 0 0 1-9 8.5 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z',
  yen:      'M5 4l7 8 7-8M12 12v8M8 16h8M8 13h8',
  edit:     'M11 4H4v16h16v-7M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  filter:   'M3 5h18M6 12h12M10 19h4',
  star:     'M12 3l3 6 6.5 1-4.7 4.6 1.2 6.4L12 18l-6 3 1.2-6.4L2.5 10 9 9z',
  clock:    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  sparkle:  'M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z',
};

export type IconName = keyof typeof PATHS | string;

interface IconProps {
  name: IconName;
  size?: number;
  stroke?: number;
  style?: React.CSSProperties;
  className?: string;
}

export function Icon({ name, size = 18, stroke = 1.6, style, className }: IconProps) {
  const d = PATHS[name] || PATHS.dot3;
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}
      className={className}
    >
      <path d={d} />
    </svg>
  );
}
