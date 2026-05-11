'use client';

interface CompletedStepProps {
  onClose: () => void;
  onReset?: () => void;
}

export default function CompletedStep({
  onClose,
  onReset,
}: CompletedStepProps) {
  const handleSignup = () => {
    window.location.href = '/signup';
  };

  const handleContact = () => {
    window.location.href = '/contact';
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        paddingTop: 16,
        paddingBottom: 16,
      }}
    >
      {/* Success Header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 'clamp(28px, 6vw, 48px)',
            fontWeight: 700,
            margin: '0 0 8px 0',
            color: 'var(--c-fg)',
            fontFamily: 'var(--f-display)',
          }}
        >
          📧 資料をお送りしました
        </h1>
        <p
          style={{
            fontSize: 14,
            color: 'var(--c-fg-3)',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          メールの受信トレイをご確認ください
        </p>
      </div>

      {/* Main Message */}
      <div
        style={{
          maxWidth: 600,
          marginBottom: 40,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 'clamp(24px, 5vw, 32px)',
            fontWeight: 700,
            lineHeight: 1.6,
            color: 'var(--c-fg)',
            fontFamily: 'var(--f-display)',
          }}
        >
          あなたのサロンでも、
          <br />
          <span style={{ color: 'var(--c-accent)' }}>明日からこれが起きます。</span>
        </p>
      </div>

      {/* Main CTA */}
      <button
        onClick={handleSignup}
        style={{
          maxWidth: 500,
          width: '100%',
          padding: '16px 32px',
          background: 'var(--c-accent)',
          color: 'var(--c-on-accent)',
          border: 'none',
          borderRadius: 999,
          fontSize: 'clamp(14px, 2.5vw, 18px)',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 4px 16px rgba(200, 163, 102, 0.2)',
          marginBottom: 16,
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
        🎁 14日間無料で試す →
      </button>

      {/* Sub CTA */}
      <button
        onClick={handleContact}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          fontSize: 13,
          color: 'var(--c-fg-3)',
          textDecoration: 'underline',
          marginBottom: 40,
          fontFamily: 'inherit',
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--c-fg)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--c-fg-3)';
        }}
      >
        ご希望の方は、個別相談も承ります
      </button>

      {/* Divider */}
      <div
        style={{
          width: '100%',
          height: 1,
          background: 'var(--c-border-2)',
          marginBottom: 24,
        }}
      />

      {/* Bottom Actions */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          width: '100%',
          maxWidth: 320,
        }}
      >
        {/* Reset button */}
        {onReset && (
          <button
            onClick={onReset}
            style={{
              padding: '12px 20px',
              background: 'var(--c-bg-2)',
              color: 'var(--c-fg)',
              border: '1px solid var(--c-border)',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.2s, border-color 0.2s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                'var(--c-bg)';
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                'var(--c-accent-soft)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                'var(--c-bg-2)';
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                'var(--c-border)';
            }}
          >
            🔄 別のお客様で、もう一度体験する
          </button>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            padding: '12px 20px',
            background: 'transparent',
            color: 'var(--c-fg-3)',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'color 0.2s',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--c-fg)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--c-fg-3)';
          }}
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
