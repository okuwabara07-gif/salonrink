'use client';
// B-2 画面11「どの診断をはじめますか？」
// 6種（髪質/白髪/頭皮/爪・ネイル/まつげ/カラー）→ /liff/diagnosis/[kind]
// 月間回数は get-mycarte v40 の month_count / plan.diag_limit を表示。

import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { bootLiff } from '../_lib/liffLite';

const FN_MYCARTE = 'https://fmpmgilgvvfezursmyic.supabase.co/functions/v1/get-mycarte';

const KINDS: { kind: string; kanji: string; title: string; desc: string }[] = [
  { kind: 'hair', kanji: '髪', title: '髪質診断', desc: 'ツヤ・うねり・ダメージをスコア化' },
  { kind: 'gray', kanji: '白', title: '白髪診断', desc: '白髪の見え方と分布を解析' },
  { kind: 'scalp', kanji: '頭', title: '頭皮診断', desc: '乾燥・皮脂・赤みの状態を確認' },
  { kind: 'nail', kanji: '爪', title: '爪・ネイル診断', desc: '爪の見た目とケアの目安' },
  { kind: 'lash', kanji: '睫', title: 'まつげ診断', desc: '長さ・密度・カールの状態' },
  { kind: 'color', kanji: '色', title: 'カラー診断', desc: '似合う色の傾向の目安' },
];

const card: CSSProperties = { background: '#fff', borderRadius: 18, padding: 17, display: 'flex', flexDirection: 'column', gap: 9, boxShadow: '0 1px 0 #E5DDCF' };

export default function DiagnosisSelectPage() {
  const [count, setCount] = useState<{ used: number; limit: number; plan: string } | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const b = await bootLiff();
      if (b.status !== 'ok' || !b.userId) return;
      try {
        const r = await fetch(FN_MYCARTE, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ line_user_id: b.userId }),
        });
        const j = await r.json();
        if (alive && j?.ok) {
          setCount({
            used: Number(j.month_count) || 0,
            limit: Number(j?.plan?.diag_limit) || 2,
            plan: j?.plan?.is_premium ? 'プレミアム' : '無料プラン',
          });
        }
      } catch { /* 表示は任意情報なので黙って省略 */ }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div style={{ minHeight: '100dvh', background: '#F3EEE5', color: '#2E2A24', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 18px 14px', borderBottom: '1px solid #E5DDCF', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link href="/liff/home" style={{ fontSize: 15, color: '#8A7A5F', textDecoration: 'none' }}>‹</Link>
        <span style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 17, fontWeight: 500 }}>どの診断をはじめますか？</span>
      </div>
      <div style={{ padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {count && (
          <div style={{ background: '#EDE5D6', borderRadius: 18, padding: '13px 17px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11.5, color: '#5F584E' }}>今月の診断回数</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#8A7A5F' }}>
              {count.used} / {count.limit}回 <span style={{ fontWeight: 400, color: '#A2988A' }}>（{count.plan}）</span>
            </span>
          </div>
        )}
        <div style={card}>
          {KINDS.map((k) => (
            <Link key={k.kind} href={`/liff/diagnosis/${k.kind}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #E5DDCF', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 15, color: '#A98D4B', width: 22, flex: 'none' }}>{k.kanji}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <b style={{ fontSize: 12.5 }}>{k.title}</b>
                    <span style={{ fontSize: 10.5, color: '#A2988A' }}>{k.desc}</span>
                  </div>
                </div>
                <span style={{ color: '#A2988A' }}>›</span>
              </div>
            </Link>
          ))}
        </div>
        <span style={{ fontSize: 10.5, lineHeight: 1.7, color: '#A2988A', textAlign: 'center' }}>
          診断結果はカルテに保存され、おすすめ商品と事前カルテに反映されます
        </span>
      </div>
    </div>
  );
}
