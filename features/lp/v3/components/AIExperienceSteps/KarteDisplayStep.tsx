'use client';

import { useState } from 'react';

interface KarteDisplayStepProps {
  karte: {
    customer_summary: string;
    key_observations_for_stylist: string[];
    allergy_warnings: string[];
    past_conversation_reminders: string[];
    reference_suggestions: {
      note: string;
      treatment_ideas: string[];
      communication_starters: string[];
    };
    ai_disclaimer: string;
  };
  onNext: () => void;
}

export default function KarteDisplayStep({
  karte,
  onNext,
}: KarteDisplayStepProps) {
  const [isReferencesOpen, setIsReferencesOpen] = useState(false);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <h2
          style={{
            fontSize: 'clamp(20px, 3.5vw, 26px)',
            fontWeight: 700,
            margin: '0 0 8px 0',
            color: 'var(--c-fg)',
            fontFamily: 'var(--f-display)',
          }}
        >
          AI が整理した、美容師さんへの引き継ぎメモ
        </h2>
        <p
          style={{
            fontSize: 13,
            color: 'var(--c-fg-3)',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          ここから先は、あなたの経験と判断で施術を組み立ててください
        </p>
      </div>

      {/* Cards Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
        {/* Card 1: Customer Summary */}
        <div
          style={{
            background: '#FAF0E0',
            border: '1px solid #f0e6d6',
            borderRadius: 12,
            padding: 20,
            borderLeft: '4px solid var(--c-accent)',
          }}
        >
          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--c-fg)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>📋</span> お客様のお声(AI が整理)
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: 'var(--c-fg)',
              lineHeight: 1.8,
            }}
          >
            {karte.customer_summary}
          </p>
        </div>

        {/* Card 2: Key Observations */}
        <div
          style={{
            background: '#FAF0E0',
            border: '1px solid #f0e6d6',
            borderRadius: 12,
            padding: 20,
            borderLeft: '4px solid var(--c-accent)',
          }}
        >
          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--c-fg)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>✨</span> 美容師さんが知っておくこと
          </h3>
          <ul
            style={{
              margin: 0,
              paddingLeft: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              listStyle: 'none',
            }}
          >
            {karte.key_observations_for_stylist.map((obs, idx) => (
              <li
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  fontSize: 14,
                  color: 'var(--c-fg)',
                  lineHeight: 1.7,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--c-accent)',
                    flexShrink: 0,
                    marginTop: 6,
                  }}
                />
                {obs}
              </li>
            ))}
          </ul>
        </div>

        {/* Card 3: Allergy Warnings (conditional) */}
        {karte.allergy_warnings.length > 0 && (
          <div
            style={{
              background: '#FEE2E2',
              border: '1px solid #FECACA',
              borderRadius: 12,
              padding: 20,
              borderLeft: '4px solid #B91C1C',
            }}
          >
            <h3
              style={{
                margin: '0 0 12px 0',
                fontSize: 15,
                fontWeight: 700,
                color: '#B91C1C',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>⚠️</span> 安全のための確認事項
            </h3>
            <ul
              style={{
                margin: 0,
                paddingLeft: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                listStyle: 'none',
              }}
            >
              {karte.allergy_warnings.map((warning, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    fontSize: 14,
                    color: '#B91C1C',
                    lineHeight: 1.7,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#B91C1C',
                      flexShrink: 0,
                      marginTop: 6,
                    }}
                  />
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Card 4: Past Conversation Reminders */}
        <div
          style={{
            background: '#E6F9F0',
            border: '1px solid #CCEDE4',
            borderRadius: 12,
            padding: 20,
            borderLeft: '4px solid #d4a574',
          }}
        >
          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--c-fg)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>💭</span> 前回までのお話
          </h3>
          <ul
            style={{
              margin: 0,
              paddingLeft: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              listStyle: 'none',
            }}
          >
            {karte.past_conversation_reminders.map((reminder, idx) => (
              <li
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  fontSize: 14,
                  color: 'var(--c-fg)',
                  lineHeight: 1.7,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#d4a574',
                    flexShrink: 0,
                    marginTop: 6,
                  }}
                />
                {reminder}
              </li>
            ))}
          </ul>
        </div>

        {/* Collapsible: Reference Suggestions */}
        <div
          style={{
            background: 'var(--c-bg-2)',
            border: '1px solid var(--c-border)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <button
            onClick={() => setIsReferencesOpen(!isReferencesOpen)}
            style={{
              width: '100%',
              padding: 20,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                'rgba(201, 169, 97, 0.05)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                'transparent';
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--c-fg)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>🔍</span> AI からの参考案(あなたの判断材料に)
            </h3>
            <span
              style={{
                fontSize: 12,
                color: 'var(--c-fg-4)',
                transition: 'transform 0.2s',
                transform: isReferencesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              ▼
            </span>
          </button>

          {/* Expanded content */}
          {isReferencesOpen && (
            <div
              style={{
                borderTop: '1px solid var(--c-border)',
                padding: 20,
                paddingTop: 16,
                animation: 'slideDown 0.2s ease-out',
              }}
            >
              <p
                style={{
                  margin: '0 0 16px 0',
                  fontSize: 13,
                  color: 'var(--c-fg-3)',
                  lineHeight: 1.7,
                  fontStyle: 'italic',
                }}
              >
                {karte.reference_suggestions.note}
              </p>

              <div style={{ marginBottom: 16 }}>
                <h4
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--c-fg)',
                  }}
                >
                  参考施術案
                </h4>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    listStyle: 'none',
                  }}
                >
                  {karte.reference_suggestions.treatment_ideas.map(
                    (idea, idx) => (
                      <li
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 8,
                          fontSize: 13,
                          color: 'var(--c-fg-2)',
                          lineHeight: 1.6,
                        }}
                      >
                        <span
                          style={{
                            color: 'var(--c-accent-2)',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          ▸
                        </span>
                        {idea}
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div>
                <h4
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--c-fg)',
                  }}
                >
                  声かけのヒント
                </h4>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    listStyle: 'none',
                  }}
                >
                  {karte.reference_suggestions.communication_starters.map(
                    (starter, idx) => (
                      <li
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 8,
                          fontSize: 13,
                          color: 'var(--c-fg-2)',
                          lineHeight: 1.6,
                        }}
                      >
                        <span
                          style={{
                            color: 'var(--c-accent-2)',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          ▸
                        </span>
                        {starter}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div
        style={{
          background: 'transparent',
          padding: '16px 0',
          borderTop: '1px solid var(--c-border-2)',
          marginBottom: 24,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: 'var(--c-fg-4)',
            lineHeight: 1.7,
          }}
        >
          📌 {karte.ai_disclaimer}
        </p>
      </div>

      {/* CTA Button */}
      <button
        onClick={onNext}
        style={{
          width: '100%',
          padding: '16px 24px',
          background: 'var(--c-accent)',
          color: 'var(--c-on-accent)',
          border: 'none',
          borderRadius: 999,
          fontSize: 16,
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 4px 16px rgba(200, 163, 102, 0.2)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform =
            'translateY(-2px)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            '0 8px 24px rgba(200, 163, 102, 0.3)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform =
            'translateY(0)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            '0 4px 16px rgba(200, 163, 102, 0.2)';
        }}
      >
        次へ: BEFORE/AFTER を見る
      </button>

      {/* Animations */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
