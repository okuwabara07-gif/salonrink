import React from 'react';
import * as Icons from 'lucide-react';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
  strokeWidth?: number;
}

export default function Icon({
  name,
  size = 20,
  className = '',
  color = 'currentColor',
  strokeWidth = 2,
}: IconProps) {
  const IconComponent = Icons[name as keyof typeof Icons] as React.ComponentType<any>;

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }

  return (
    <IconComponent
      size={size}
      className={className}
      color={color}
      strokeWidth={strokeWidth}
    />
  );
}
