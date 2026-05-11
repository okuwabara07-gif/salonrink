'use client';

const CUSTOMER_PROFILES = [
  {
    id: 1 as const,
    icon: '✨',
    name: 'みさき・28歳',
    situation: 'こだわり派OL、月1美容室',
    pain: '毎回同じ説明、好みを覚えてもらえない',
    desire: 'いつも完璧な仕上がりで帰りたい',
  },
  {
    id: 2 as const,
    icon: '🌸',
    name: 'あゆみ・40歳',
    situation: '主婦、白髪染め、敏感肌',
    pain: '薬剤の説明が手間、肌トラブルが心配',
    desire: '安全に、自然な仕上がりに',
  },
  {
    id: 3 as const,
    icon: '💼',
    name: 'けんじ・30歳',
    situation: '会社員、月1利用、清潔感重視',
    pain: '時間がない、雑な対応が不安',
    desire: 'サッと終わって、毎回同じ品質',
  },
];

interface CustomerProfileSelectStepProps {
  onSelect: (id: 1 | 2 | 3) => void;
}

export default function CustomerProfileSelectStep({ onSelect }: CustomerProfileSelectStepProps) {
  return (
    <div>
      {/* Header */}
      <h3 style={{
        fontFamily: 'var(--f-display)',
        fontSize: '28px',
        marginTop: 0,
        marginBottom: 12,
        color: 'var(--c-fg)',
        fontWeight: 'bold',
      }}>
        今日は、どんなあなた?
      </h3>
      <p style={{
        fontSize: '14px',
        color: 'var(--c-fg-2)',
        marginTop: 0,
        marginBottom: 32,
        lineHeight: 1.6,
      }}>
        あなたに近いタイプを選ぶと、お客様体験をシミュレーションできます
      </p>

      {/* Profile cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16,
      }}>
        {CUSTOMER_PROFILES.map((profile) => (
          <button
            key={profile.id}
            onClick={() => onSelect(profile.id)}
            style={{
              padding: 24,
              backgroundColor: 'white',
              border: '2px solid transparent',
              borderRadius: 12,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'left',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#06C755';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(6, 199, 85, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
            }}
          >
            {/* Icon */}
            <div style={{
              fontSize: '32px',
              marginBottom: 12,
            }}>
              {profile.icon}
            </div>

            {/* Name */}
            <h4 style={{
              margin: '0 0 8px 0',
              fontSize: '16px',
              fontWeight: 'bold',
              color: 'var(--c-fg)',
            }}>
              {profile.name}
            </h4>

            {/* Situation */}
            <p style={{
              margin: '0 0 12px 0',
              fontSize: '13px',
              color: 'var(--c-fg-2)',
              lineHeight: 1.5,
            }}>
              {profile.situation}
            </p>

            {/* Pain */}
            <div style={{
              backgroundColor: '#FFF3E0',
              padding: '10px 12px',
              borderRadius: 8,
              marginBottom: 10,
              fontSize: '12px',
              color: '#E65100',
              lineHeight: 1.5,
            }}>
              <strong>🥹 お悩み:</strong> {profile.pain}
            </div>

            {/* Desire */}
            <div style={{
              backgroundColor: '#E8F5E9',
              padding: '10px 12px',
              borderRadius: 8,
              fontSize: '12px',
              color: '#1B5E20',
              lineHeight: 1.5,
            }}>
              <strong>✨ 願い:</strong> {profile.desire}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
