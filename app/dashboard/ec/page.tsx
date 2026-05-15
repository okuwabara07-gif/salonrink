'use client';

import React from 'react';
import Link from 'next/link';

/**
 * /dashboard/ec — 店販EC(Phase 8 で追加・Coming Soon)
 * COLORPASS OEM 化粧品事業のローンチ準備中。
 * 薬機法ライセンス取得後にフルローンチ。
 */

export default function EcPage() {
  return (
    <div style={{ padding: '8px 36px 28px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--serif)',
            fontSize: 34,
            fontWeight: 500,
            color: 'var(--ink)',
            letterSpacing: '0.01em',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          店販EC
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: 999,
              background: 'rgba(138,126,114,0.18)',
              color: '#6b6357',
              letterSpacing: '0.04em',
              fontFamily: 'var(--sans)',
            }}
          >
            Coming Soon
          </span>
        </h1>
        <p
          style={{
            margin: '8px 0 0',
            fontSize: 13,
            color: 'var(--muted)',
          }}
        >
          サロン専用 EC 機能(2026年下半期 ローンチ予定)
        </p>
      </div>

      {/* Hero coming-soon card */}
      <div
        style={{
          background: 'var(--paper)',
          border: '1px solid var(--line-2)',
          borderRadius: 18,
          padding: '40px 32px',
          textAlign: 'center',
          marginBottom: 20,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative shopping bag */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background:
              'linear-gradient(135deg, rgba(184,149,100,0.18), rgba(184,149,100,0.08))',
            display: 'inline-grid',
            placeItems: 'center',
            color: '#7a5e3a',
            marginBottom: 18,
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 7h12l-1 13H7L6 7z" />
            <path d="M9 7V5a3 3 0 0 1 6 0v2" />
          </svg>
        </div>
        <h2
          style={{
            margin: '0 0 10px',
            fontFamily: 'var(--serif)',
            fontSize: 22,
            fontWeight: 500,
            color: 'var(--ink)',
            letterSpacing: '0.02em',
          }}
        >
          店販ECは現在開発中です
        </h2>
        <p
          style={{
            margin: '0 auto',
            maxWidth: 480,
            fontSize: 13,
            color: 'var(--ink-2)',
            lineHeight: 1.7,
          }}
        >
          サロン専用シャンプー・トリートメントを LINE 公式アカウント経由で
          ご購入いただける機能です。
          <br />
          リリースは <b>2026年下半期</b> を予定しています。
        </p>
      </div>

      {/* Feature preview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 14,
          marginBottom: 22,
        }}
      >
        {[
          {
            icon: '🛍',
            title: 'サロン直販',
            desc: 'シャンプー・トリートメント等、サロンで使うアイテムを直接販売',
          },
          {
            icon: '🚚',
            title: '定期便対応',
            desc: '月1・2ヶ月に1回の自動配送で、顧客の継続購入を促進',
          },
          {
            icon: '💰',
            title: '在庫不要',
            desc: 'COLORPASS が在庫・配送を一括管理。サロンは販売のみ',
          },
        ].map((f) => (
          <div
            key={f.title}
            style={{
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 12,
              padding: '18px 18px',
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 8 }}>{f.icon}</div>
            <div
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: 'var(--ink)',
                marginBottom: 6,
              }}
            >
              {f.title}
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: 'var(--muted)',
                lineHeight: 1.55,
              }}
            >
              {f.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Waitlist CTA */}
      <div
        style={{
          background:
            'linear-gradient(135deg, rgba(184,149,100,0.08), rgba(90,107,60,0.05))',
          border: '1px solid rgba(184,149,100,0.30)',
          borderRadius: 18,
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 18,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--ink)',
              marginBottom: 4,
            }}
          >
            リリース通知を受け取る
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
            ローンチ時にメールでお知らせします。
          </div>
        </div>
        <Link
          href="/dashboard/more"
          style={{
            background: 'var(--ink)',
            color: '#f0e6d2',
            padding: '10px 18px',
            borderRadius: 10,
            fontSize: 12.5,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          通知を有効化 →
        </Link>
      </div>
    </div>
  );
}
