'use client';

import React from 'react';
import Link from 'next/link';

/**
 * /dashboard/plan — プラン管理(Phase 8 で追加)
 * 現状: FREE プラン表示 + アップグレード CTA
 * 後続: Stripe Customer Portal 統合
 */

export default function PlanPage() {
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
          }}
        >
          プラン
        </h1>
        <p
          style={{
            margin: '8px 0 0',
            fontSize: 13,
            color: 'var(--muted)',
          }}
        >
          ご契約中のプランと請求情報
        </p>
      </div>

      {/* Current plan card */}
      <div
        style={{
          background: 'var(--paper)',
          border: '1px solid var(--line-2)',
          borderRadius: 18,
          padding: '28px 32px',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: 6,
              }}
            >
              現在のプラン
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 10,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 28,
                  fontWeight: 600,
                  color: 'var(--ink)',
                }}
              >
                FREE
              </span>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                ¥0 / 月
              </span>
            </div>
          </div>
          <Link
            href="/pricing"
            style={{
              background: 'var(--ink)',
              color: '#f0e6d2',
              padding: '11px 20px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            プランをアップグレード →
          </Link>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 14,
            paddingTop: 16,
            borderTop: '1px solid var(--line)',
          }}
        >
          {[
            { k: '顧客数', v: '無制限' },
            { k: 'スタッフ数', v: '1名まで' },
            { k: '予約管理', v: '✓' },
            { k: 'HPB同期', v: '✓' },
            { k: 'AIカルテ', v: '— (Standard以上)' },
          ].map((r) => (
            <div key={r.k}>
              <div
                style={{
                  fontSize: 10.5,
                  color: 'var(--muted)',
                  marginBottom: 3,
                }}
              >
                {r.k}
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>
                {r.v}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended */}
      <div
        style={{
          padding: '24px 28px',
          background:
            'linear-gradient(135deg, rgba(184,149,100,0.08), rgba(107,45,58,0.05))',
          border: '1px solid rgba(184,149,100,0.30)',
          borderRadius: 18,
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#7a5e3a',
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          おすすめのアップグレード
        </div>
        <div
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 22,
            fontWeight: 500,
            color: 'var(--ink)',
            marginBottom: 6,
            letterSpacing: '0.02em',
          }}
        >
          Standard プラン — AIカルテ標準装備
        </div>
        <div
          style={{
            fontSize: 13,
            color: 'var(--ink-2)',
            lineHeight: 1.6,
            marginBottom: 16,
          }}
        >
          AIカルテ・カウンセリングフォーム・予約自動連携・LINE配信が標準。
          月¥1,980から。
        </div>
        <Link
          href="/pricing"
          style={{
            display: 'inline-block',
            background: 'var(--paper)',
            border: '1px solid var(--line-2)',
            color: 'var(--ink)',
            padding: '10px 18px',
            borderRadius: 10,
            fontSize: 12.5,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          詳しく見る →
        </Link>
      </div>
    </div>
  );
}
