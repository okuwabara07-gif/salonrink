// LIFF ID の解決。public/neo/miniapp.html の SR_LIFF_IDS と同一仕様に揃える。
// 審査用の ?liffenv=review 導線を壊すと LINE ミニアプリ審査が再び通らなくなるため、
// マップとクエリ切替は miniapp.html 側と必ず一致させること。
export const SR_LIFF_IDS = {
  production: '2010387325-N1TlMFzx',
  review: '2010387324-sfBMjJkW',
  dev: '2010387323-3nLl1HmS',
} as const

export type SrLiffEnv = keyof typeof SR_LIFF_IDS

export function resolveLiffEnv(search: string): SrLiffEnv {
  let raw: string | null = null
  try {
    raw = new URLSearchParams(search).get('liffenv')
  } catch {
    raw = null
  }
  return raw === 'review' || raw === 'dev' ? raw : 'production'
}

export function resolveLiffId(search: string): string {
  return SR_LIFF_IDS[resolveLiffEnv(search)]
}

/** 画面間リンクで ?liffenv= を落とさないための付与ヘルパー */
export function withLiffEnv(href: string, search: string): string {
  const env = resolveLiffEnv(search)
  if (env === 'production') return href
  return `${href}${href.includes('?') ? '&' : '?'}liffenv=${env}`
}
