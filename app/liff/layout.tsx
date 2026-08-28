import { Zen_Kaku_Gothic_New } from 'next/font/google'
import type { ReactNode } from 'react'

const zenKakuGothicNew = Zen_Kaku_Gothic_New({
  variable: '--font-sans',
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export default function LiffLayout({ children }: { children: ReactNode }) {
  return <div className={zenKakuGothicNew.variable}>{children}</div>
}
