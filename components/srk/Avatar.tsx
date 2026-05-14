'use client';

import React from 'react';

interface AvatarProps {
  name?: string;
  color?: string;
  size?: number;
  char?: string;
}

export function Avatar({ name, color, size = 28, char }: AvatarProps) {
  return (
    <span
      className="srk-avatar"
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.42,
      }}
    >
      {char || name?.[0]}
    </span>
  );
}
