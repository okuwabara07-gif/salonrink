'use client';

import { useState, useEffect } from 'react';

const STATUS_MESSAGES = [
  'お客様のご要望を確認中...',
  '過去の会話メモを参照中...',
  '美容師さん向けに整理中...',
];

export default function AILoadingStep() {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 380,
        gap: 24,
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <h2
          style={{
            fontSize: 'clamp(20px, 3.5vw, 26px)',
            fontWeight: 700,
            margin: '0 0 8px 0',
            color: 'var(--c-fg)',
            fontFamily: 'var(--f-display)',
          }}
        >
          AI がお客様のお声を整理しています
        </h2>
        <p
          style={{
            fontSize: 13,
            color: 'var(--c-fg-3)',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          施術判断のための、引き継ぎメモを作成中
        </p>
      </div>

      {/* Spinner */}
      <div
        style={{
          width: 80,
          height: 80,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '24px 0',
        }}
      >
        {/* Outer ring */}
        <div
          style={{
            position: 'absolute',
            width: 80,
            height: 80,
            border: '3px solid rgba(201, 169, 97, 0.15)',
            borderRadius: '50%',
          }}
        />

        {/* Rotating spinner */}
        <div
          style={{
            position: 'absolute',
            width: 80,
            height: 80,
            borderTop: '3px solid var(--c-accent)',
            borderRight: '3px solid transparent',
            borderBottom: '3px solid transparent',
            borderLeft: '3px solid transparent',
            borderRadius: '50%',
            animation: 'spin 2.5s linear infinite',
          }}
        />

        {/* Inner dot */}
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: 'var(--c-accent)',
            zIndex: 1,
          }}
        />
      </div>

      {/* Status message */}
      <div
        style={{
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 220,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: 'var(--c-fg-3)',
            textAlign: 'center',
            animation: 'fadeInOut 2s ease-in-out',
            animationIterationCount: 'infinite',
            lineHeight: 1.6,
          }}
        >
          {STATUS_MESSAGES[statusIndex]}
        </p>
      </div>

      {/* Progress dots */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 12,
        }}
      >
        {STATUS_MESSAGES.map((_, idx) => (
          <div
            key={idx}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background:
                idx === statusIndex
                  ? 'var(--c-accent)'
                  : 'rgba(201, 169, 97, 0.2)',
              transition: 'background 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Animation definitions */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes fadeInOut {
          0% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
