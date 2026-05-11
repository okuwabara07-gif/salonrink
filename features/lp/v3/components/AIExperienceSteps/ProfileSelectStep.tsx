'use client';

interface ProfileSelectStepProps {
  onSelect: (id: 1 | 2 | 3) => void;
}

const PROFILE_DISPLAY = {
  1: {
    icon: '✨',
    age: 25,
    occupation: 'OL',
    concern: 'グレーカラーで透明感を出したい',
    sub: '前回ブリーチが気になる',
  },
  2: {
    icon: '🌸',
    age: 40,
    occupation: '主婦',
    concern: '白髪ぼかしハイライト',
    sub: '敏感肌(PPDA陽性)',
  },
  3: {
    icon: '💼',
    age: 30,
    occupation: '営業職',
    concern: '清潔感ある暗髪に',
    sub: 'くせ毛で朝が大変',
  },
};

export default function ProfileSelectStep({
  onSelect,
}: ProfileSelectStepProps) {
  return (
    <div>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <h2
          style={{
            fontSize: 'clamp(22px, 4vw, 28px)',
            fontWeight: 700,
            margin: '0 0 8px 0',
            color: 'var(--c-fg)',
            fontFamily: 'var(--f-display)',
          }}
        >
          今日のお客様を選んでください
        </h2>
        <p
          style={{
            fontSize: 14,
            color: 'var(--c-fg-3)',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          お一人を選ぶと、LINE 事前カウンセリングの内容が見られます
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
        className="profile-cards"
      >
        {[1, 2, 3].map((id) => {
          const profile = PROFILE_DISPLAY[id as 1 | 2 | 3];
          return (
            <button
              key={id}
              onClick={() => onSelect(id as 1 | 2 | 3)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                padding: 24,
                background: '#fff',
                border: '1px solid var(--c-border-2)',
                borderRadius: 12,
                cursor: 'pointer',
                transition:
                  'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                const button = e.currentTarget as HTMLButtonElement;
                button.style.borderColor = 'var(--c-accent)';
                button.style.boxShadow =
                  '0 8px 24px rgba(200, 163, 102, 0.15)';
                button.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                const button = e.currentTarget as HTMLButtonElement;
                button.style.borderColor = 'var(--c-border-2)';
                button.style.boxShadow = 'none';
                button.style.transform = 'translateY(0)';
              }}
            >
              {/* Header: icon + age + occupation */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 28 }}>{profile.icon}</span>
                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: 'var(--c-fg)',
                    }}
                  >
                    {profile.age}歳・{profile.occupation}
                  </div>
                </div>
              </div>

              {/* Concern */}
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--c-fg)',
                  lineHeight: 1.5,
                }}
              >
                {profile.concern}
              </div>

              {/* Sub */}
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--c-fg-3)',
                  lineHeight: 1.5,
                }}
              >
                {profile.sub}
              </div>
            </button>
          );
        })}
      </div>

      {/* Responsive adjustment for desktop */}
      <style>{`
        @media (min-width: 768px) {
          .profile-cards {
            display: flex !important;
            flex-direction: row !important;
            gap: 16px !important;
          }
          .profile-cards button {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
}
