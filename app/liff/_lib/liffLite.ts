'use client';
// B-2 診断ブロック用の軽量LIFF初期化。
// 既存 _lib/useMycarte.ts には依存しない（既存画面を触らないため）。
// ?liffenv=dev で開発LIFFに切替。LINE外ブラウザは例外にせず status='outside' を返す
// （8/18リジェクト理由①: PCブラウザで検証不能、の再発防止と同方針）。

import liff from '@line/liff';

const LIFF_PROD = '2010387325-N1TlMFzx';
const LIFF_DEV = '2010387323-3nLl1HmS';

export type LiffBoot = { status: 'ok' | 'outside'; userId: string | null };

let booted: Promise<LiffBoot> | null = null;

export function bootLiff(): Promise<LiffBoot> {
  if (booted) return booted;
  booted = (async (): Promise<LiffBoot> => {
    try {
      const env = new URLSearchParams(window.location.search).get('liffenv');
      const liffId = env === 'dev' ? LIFF_DEV : LIFF_PROD;
      await liff.init({ liffId });
      if (!liff.isLoggedIn()) return { status: 'outside', userId: null };
      const p = await liff.getProfile();
      return { status: 'ok', userId: p.userId };
    } catch {
      return { status: 'outside', userId: null };
    }
  })();
  return booted;
}

export function diagSessionId(): string {
  try {
    const k = 'sr_diag_session';
    let v = localStorage.getItem(k);
    if (!v) { v = crypto.randomUUID(); localStorage.setItem(k, v); }
    return v;
  } catch {
    return 'anon-' + Math.random().toString(36).slice(2, 10);
  }
}

export { liff };
