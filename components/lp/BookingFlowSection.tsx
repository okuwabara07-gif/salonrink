'use client'

import Image from 'next/image'

export default function BookingFlowSection() {
  return (
    <section style={{ background: '#ffffff', padding: '80px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#d88896', marginBottom: '12px' }}>
            HOW IT WORKS
          </p>
          <h2
            style={{
              fontSize: 'clamp(28px, 6vw, 44px)',
              fontWeight: 700,
              color: '#1a2c4f',
              marginBottom: '12px',
            }}
          >
            予約までの流れ
          </h2>
          <p style={{ fontSize: '16px', color: '#5a6878' }}>
            お客様も、サロンも、迷わずシンプルに。
          </p>
        </div>

        {/* デスクトップ: SVG表示 */}
        <div style={{ display: 'none' }} className="md:block">
          <div style={{ background: '#ffffff', borderRadius: '16px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', padding: '40px', textAlign: 'center' }}>
            <Image
              src="/images/lp/booking-flow.svg"
              alt="SalonRink予約フロー全体像 8ステップ"
              width={680}
              height={1480}
              style={{ width: '100%', height: 'auto', maxWidth: '680px', margin: '0 auto' }}
              unoptimized
            />
          </div>
        </div>

        {/* モバイル: ステップカード */}
        <div className="md:hidden" style={{ display: 'block' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            {[
              { num: '01', title: 'LINE友だち追加', sub: 'QRコード or URLから', tone: 'pink' },
              { num: '02', title: 'メニュー選択', sub: '画像と価格でシンプル選択', tone: 'pink' },
              { num: '03', title: 'スタッフ指名(任意)', sub: '指名なしも選択可能', tone: 'pink' },
              { num: '04', title: '日時選択', sub: 'カレンダーから空き枠を選ぶ', tone: 'pink' },
              { num: '05', title: '予約内容確認', sub: 'メニュー・スタッフ・日時を一覧', tone: 'purple' },
              { num: '06', title: '予約完了通知', sub: '即座にLINEへ確定通知', tone: 'purple' },
              { num: '07', title: '前日リマインド', sub: '自動メッセージで来店忘れ防止', tone: 'purple' },
              { num: '08', title: '来店・施術後フォロー', sub: 'マイページで履歴管理', tone: 'purple' },
            ].map((step) => {
              const colors = step.tone === 'pink'
                ? { bg: '#FBEAF0', border: '#D4537E', numColor: '#993556', titleColor: '#72243E', subColor: '#993556' }
                : { bg: '#EEEDFE', border: '#534AB7', numColor: '#3C3489', titleColor: '#26215C', subColor: '#534AB7' }
              return (
                <div
                  key={step.num}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: colors.bg,
                    borderLeft: `4px solid ${colors.border}`,
                  }}
                >
                  <span style={{ fontSize: '20px', fontWeight: 700, flexShrink: 0, width: '48px', textAlign: 'center', color: colors.numColor }}>
                    {step.num}
                  </span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '14px', margin: 0, marginBottom: '4px', color: colors.titleColor }}>{step.title}</p>
                    <p style={{ fontSize: '12px', margin: 0, color: colors.subColor }}>{step.sub}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* サマリー数値 */}
        <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxWidth: '600px', margin: '40px auto 0' }}>
          <div style={{ padding: '16px', borderRadius: '12px', textAlign: 'center', backgroundColor: '#1a2c4f' }}>
            <p style={{ fontSize: '12px', color: '#9DBDDB', margin: 0, marginBottom: '8px' }}>お客様の操作</p>
            <p style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', margin: 0 }}>約30秒</p>
          </div>
          <div style={{ padding: '16px', borderRadius: '12px', textAlign: 'center', backgroundColor: '#1a2c4f' }}>
            <p style={{ fontSize: '12px', color: '#9DBDDB', margin: 0, marginBottom: '8px' }}>受付対応</p>
            <p style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', margin: 0 }}>24時間</p>
          </div>
          <div style={{ padding: '16px', borderRadius: '12px', textAlign: 'center', backgroundColor: '#1a2c4f' }}>
            <p style={{ fontSize: '12px', color: '#9DBDDB', margin: 0, marginBottom: '8px' }}>サロンの操作</p>
            <p style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', margin: 0 }}>ゼロ</p>
          </div>
        </div>
      </div>
    </section>
  )
}
