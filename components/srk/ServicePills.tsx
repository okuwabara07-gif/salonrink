'use client';

import React from 'react';
import { SERVICES, type ServiceKey } from '@/lib/srkMockData';

interface ServicePillsProps {
  tags?: ServiceKey[] | string[];
}

export function ServicePills({ tags = [] }: ServicePillsProps) {
  return (
    <div className="srk-pills">
      {tags.map((t, i) => {
        const s = SERVICES[t as ServiceKey];
        if (!s) return null;
        return (
          <span
            key={i}
            className="srk-pill"
            style={{ color: s.color, borderColor: s.color }}
          >
            <i>{s.short}</i>
            {s.label}
          </span>
        );
      })}
    </div>
  );
}
