'use client';

import React, { useState } from 'react';

/**
 * /dashboard/news — お知らせ(Phase 8 で追加)
 * 現状: 運営からのお知らせ・新機能・障害情報のリスト
 * 後続: Supabase notifications テーブル統合
 */

interface NewsItem {
  id: string;
  date: string;
  category: 'feature' | 'maintenance' | 'tip';
  title: string;
  body: string;
  unread: boolean;
}

const CATEGORY_META: Record<NewsItem['category'], { label: string; bg: string; fg: string }> = {
  feature:     { label: '新機能',  bg: 'rgba(184,149,100,0.20)', fg: '#7a5e3a' },
  maintenance: { label: 'メンテ',  bg: 'rgba(168,90,62,0.10)',   fg: '#a85a3e' },
  tip:         { label: 'ヒント',  bg: 'rgba(90,107,60,0.12)',   fg: '#5a6b3c' },
};

const NEWS: NewsItem[] = [
  {
    id: 'n1',
    date: '2026/05/14',
    category: 'feature',
    title: 'HPB予約の自動同期が安定稼働を開始しました',
    body: 'ホットペッパー予約の取り込みが30分間隔で自動実行されるようになりました。連携ページから接続状態を確認できます。',
    unread: true,
  },
  {
    id: 'n2',
    date: '2026/05/13',
    category: 'feature',
    title: '顧客カルテに4タブ構成を導入',
    body: '概要・来店履歴・カルテ・メッセージの4つのタブで顧客情報を整理できるようになりました。',
    unread: true,
  },
  {
    id: 'n3',
    date: '2026/05/10',
    category: 'tip',
    title: 'AIカルテで紹介率が3.2倍になった事例',
    body: 'カウンセリング自動化で顧客の満足度を上げ、紹介につなげる方法をご紹介します。',
    unread: true,
  },
  {
    id: 'n4',
    date: '2026/05/05',
    category: 'maintenance',
    title: '5/8(水) 深夜 0:00-2:00 メンテナンスのお知らせ',
    body: 'データベース更新のため一時的にサービスを停止します。ご了承ください。',
    unread: false,
  },
];

export default function NewsPage() {
  const [filter, setFilter] = useState<'all' | NewsItem['category']>('all');
  const filtered = NEWS.filter((n) => filter === 'all' || n.category === filter);

  return (
    <div style={{ padding: '8px 36px 28px' }}>
      <div style={{ marginBottom: 22 }}>
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
          お知らせ
        </h1>
        <p
          style={{
            margin: '8px 0 0',
            fontSize: 13,
            color: 'var(--muted)',
          }}
        >
          運営からのお知らせ・新機能・メンテナンス情報
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 18,
          flexWrap: 'wrap',
        }}
      >
        {(
          [
            { id: 'all', label: 'すべて' },
            { id: 'feature', label: '新機能' },
            { id: 'tip', label: 'ヒント' },
            { id: 'maintenance', label: 'メンテ' },
          ] as const
        ).map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                border: `1px solid ${active ? 'var(--ink)' : 'var(--line-2)'}`,
                background: active ? 'var(--ink)' : 'transparent',
                color: active ? '#f0e6d2' : 'var(--ink)',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map((n) => {
          const cat = CATEGORY_META[n.category];
          return (
            <article
              key={n.id}
              style={{
                background: 'var(--paper)',
                border: '1px solid var(--line-2)',
                borderRadius: 14,
                padding: '18px 22px',
                position: 'relative',
              }}
            >
              {n.unread && (
                <span
                  style={{
                    position: 'absolute',
                    top: 22,
                    left: -4,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--gold)',
                  }}
                />
              )}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: cat.bg,
                    color: cat.fg,
                    letterSpacing: '0.04em',
                  }}
                >
                  {cat.label}
                </span>
                <span
                  className="mono"
                  style={{ fontSize: 11, color: 'var(--muted)' }}
                >
                  {n.date}
                </span>
              </div>
              <h2
                style={{
                  margin: '0 0 6px',
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--ink)',
                  lineHeight: 1.4,
                }}
              >
                {n.title}
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 12.5,
                  color: 'var(--ink-2)',
                  lineHeight: 1.6,
                }}
              >
                {n.body}
              </p>
            </article>
          );
        })}
        {filtered.length === 0 && (
          <div
            style={{
              padding: 48,
              textAlign: 'center',
              color: 'var(--muted)',
              fontSize: 13,
              background: 'var(--paper)',
              borderRadius: 14,
              border: '1px dashed var(--line-2)',
            }}
          >
            該当するお知らせがありません
          </div>
        )}
      </div>
    </div>
  );
}
