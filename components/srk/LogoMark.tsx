'use client'

import Image from 'next/image'

interface LogoMarkProps {
  variant?: 'horizontal' | 'mark'
  height?: number
  className?: string
}

export function LogoMark({
  variant = 'horizontal',
  height = 32,
  className,
}: LogoMarkProps) {
  const src = variant === 'mark'
    ? '/logo/salonrink-mark.png'
    : '/logo/salonrink-horizontal.png'

  const aspectRatio = variant === 'mark' ? 1 : 2

  return (
    <div className={className} style={{ position: 'relative', height, width: 'auto' }}>
      <Image
        src={src}
        alt="SalonRink Concierge"
        height={height}
        width={height * aspectRatio}
        style={{ height: '100%', width: 'auto' }}
        priority
      />
    </div>
  )
}
