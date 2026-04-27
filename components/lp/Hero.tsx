'use client'

export default function Hero() {
  return (
    <section
      style={{
        background: 'linear-gradient(135deg, #b8d4e8 0%, #9dbddb 100%)',
        padding: '80px 20px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ダミー背景画像 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '40%',
          height: '100%',
          background: 'linear-gradient(135deg, #c8d4e0 0%, #b4c0d0 100%)',
          opacity: 0.3,
          zIndex: 0,
        }}
      />

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* バッジ */}
        <div
          style={{
            display: 'inline-block',
            background: 'var(--sr-pink-pale)',
            color: 'var(--sr-pink-text)',
            padding: '8px 16px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '24px',
          }}
        >
          ✓ 美容師監修・実装サロンで検証済み
        </div>

        <h1
          style={{
            fontSize: 'clamp(32px, 8vw, 56px)',
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.2,
            marginBottom: '24px',
          }}
        >
          HPBはそのまま、<br />
          自分らしいサロン運営へ
        </h1>

        <p
          style={{
            fontSize: 'clamp(16px, 4vw, 20px)',
            color: 'rgba(255,255,255,0.95)',
            lineHeight: 1.6,
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px',
          }}
        >
          LINE予約・顧客カルテ・売上管理、全部ひとつで。
          <br />
          ホットペッパーの顧客データをそのまま活用できる唯一のSaaS。
        </p>

        <div
          style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '60px',
          }}
        >
          <a
            href="/register"
            style={{
              background: 'linear-gradient(135deg, #ffd1dc 0%, #f0a0a0 100%)',
              color: '#ffffff',
              padding: '16px 40px',
              borderRadius: '999px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '16px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(240,160,160,0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(240,160,160,0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(240,160,160,0.3)'
            }}
          >
            無料で始める（14日間）
          </a>
          <button
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: '#ffffff',
              padding: '16px 40px',
              borderRadius: '999px',
              border: '2px solid rgba(255,255,255,0.4)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
            }}
          >
            デモを見る
          </button>
        </div>

        {/* ダミーダッシュボード画像 */}
        <div
          style={{
            background: 'linear-gradient(135deg, #d8c8b8 0%, #c4b4a4 100%)',
            aspectRatio: '16/9',
            borderRadius: '16px',
            maxWidth: '800px',
            margin: '0 auto',
            boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
          }}
        />
      </div>
    </section>
  )
}
