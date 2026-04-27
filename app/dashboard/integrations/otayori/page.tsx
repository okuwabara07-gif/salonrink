export default function OtayoriPage() {
  return (
    <main style={{ padding: '40px', maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: 28, fontWeight: 400, letterSpacing: 4, color: '#1A1018', margin: '40px 0' }}>
        📮 おたより配信
      </h1>
      <p style={{ fontSize: 16, color: '#888', marginBottom: 40 }}>
        このページは準備中です。Phase B で実装予定です。
      </p>
      <div style={{
        background: '#F8F4EF',
        border: '2px dashed #B8966A',
        borderRadius: 12,
        padding: 40,
      }}>
        <p style={{ fontSize: 14, color: '#7A6E64', lineHeight: 1.8 }}>
          顧客にメッセージを一括配信する機能です。<br />
          テキスト本文 + クーポン・キャンペーン告知をまとめて配信できます。
        </p>
      </div>
    </main>
  )
}
