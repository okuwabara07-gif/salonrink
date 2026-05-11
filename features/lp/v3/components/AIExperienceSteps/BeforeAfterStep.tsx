'use client';

interface BeforeAfterStepProps {
  onNext: () => void;
}

const BEFORE_POINTS = [
  '来店時にゼロから質問',
  'カウンセリングに20分、施術時間が削られる',
  'カルテは終わってから10分かけて手書き',
  '「前回どんなカラーでしたっけ?」を毎回確認',
  'お客様情報を頭の中だけで管理',
];

const AFTER_POINTS = [
  '来店前に LINE で事前カウンセリング完了',
  '施術前に2分の引き継ぎメモ確認、施術に集中',
  'カルテ作成は AI が下準備、あなたは仕上げ確認のみ',
  '過去の会話メモがいつでも参照可能',
  'お客様1人1人を、ちゃんと「覚えていられる」',
];

export default function BeforeAfterStep({ onNext }: BeforeAfterStepProps) {
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
          美容師さんの体験は、こう変わります
        </h2>
        <p
          style={{
            fontSize: 13,
            color: 'var(--c-fg-3)',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          SalonRink を使う前と使ってからの違いを、ご覧ください
        </p>
      </div>

      {/* Two-column comparison */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 20,
          marginBottom: 32,
        }}
      >
        {/* BEFORE Column */}
        <div
          style={{
            background: '#F5F5F5',
            borderRadius: 12,
            padding: 24,
            border: '1px solid #E8E8E8',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          }}
        >
          <h3
            style={{
              margin: '0 0 20px 0',
              fontSize: 18,
              fontWeight: 700,
              color: '#5A5A5A',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>🥹</span> これまでの美容師さん
          </h3>

          <ul
            style={{
              margin: 0,
              paddingLeft: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              listStyle: 'none',
            }}
          >
            {BEFORE_POINTS.map((point, idx) => (
              <li
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  fontSize: 14,
                  color: '#555',
                  lineHeight: 1.7,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#999',
                    flexShrink: 0,
                    marginTop: 6,
                  }}
                />
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* AFTER Column */}
        <div
          style={{
            background: '#FAF0E0',
            borderRadius: 12,
            padding: 24,
            border: '1px solid #F0E6D6',
            boxShadow: '0 8px 24px rgba(201, 169, 97, 0.15)',
            position: 'relative',
          }}
        >
          {/* Glow effect */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 100% 0%, rgba(201, 169, 97, 0.1) 0%, transparent 70%)',
              borderRadius: 12,
              pointerEvents: 'none',
            }}
          />

          <h3
            style={{
              margin: '0 0 20px 0',
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--c-fg)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <span>✨</span> SalonRink と歩む美容師さん
          </h3>

          <ul
            style={{
              margin: 0,
              paddingLeft: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              listStyle: 'none',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {AFTER_POINTS.map((point, idx) => (
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
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Middle message */}
      <div
        style={{
          background: 'var(--c-bg-2)',
          borderRadius: 12,
          padding: 32,
          textAlign: 'center',
          marginBottom: 32,
          border: '1px solid var(--c-border)',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 'clamp(16px, 3vw, 18px)',
            lineHeight: 1.7,
            color: 'var(--c-fg)',
          }}
        >
          月
          <span
            style={{
              fontSize: 'clamp(28px, 5vw, 36px)',
              fontWeight: 700,
              color: 'var(--c-accent)',
              margin: '0 6px',
            }}
          >
            25時間
          </span>
          。<br />
          お客様との対話に、戻ってきます。
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
        あなたのサロンでも始めてみる
      </button>
    </div>
  );
}
