'use client'

// デザイントークン（ホーム系 クリーム／明朝トーン）
const TOKENS = {
  bg: {
    main: '#F3EEE5',
    page: '#EFEAE0',
    card: '#FFFFFF',
    surface: '#F7F3EA',
    surfaceStrong: '#EDE5D6',
    placeholder: '#EFE8DA',
  },
  border: '#E5DDCF',
  accent: {
    gold: '#A98D4B',
    goldLight: '#C9B27C',
    goldLighter: '#E7DCC4',
  },
  text: {
    primary: '#2E2A24',
    secondary: '#5F584E',
    tertiary: '#7A7266',
    quaternary: '#A2988A',
    weak: '#B3A996',
    gold: '#8A7A5F',
  },
  button: {
    dark: '#1B1815',
  },
  warning: {
    border: '#D9B3A6',
    surface: '#FBF1ED',
    text: '#A8705C',
  },
}

interface TileData {
  label: string
  color: string
  badge: boolean
  expiring: boolean
}

interface DiagnosticItem {
  title: string
  date: string
  isUnread: boolean
}

export default function HomePage() {
  // ダミーデータ（実装時はProps/APIから取得）
  const data = {
    userName: '花子',
    lastVisitDaysAgo: 106,
    nextAppointmentDate: '6/15（月）',
    nextAppointmentTime: '14:00',
    karteCompletionPercent: 80,
    karteScore: 74,
    karteScoreChange: 6,
    scalpScore: 61,
    grayScore: 90,
    recordsCount: 36,
    photosStored: 9,
    photosLimit: 12,
    storagePlanDays: 90,
    diagnosticsLastDate: {
      hair: '6/28',
      scalp: '6/10',
      gray: '5/22',
    },
  }

  const tiles: TileData[] = [
    { label: '今日', color: TOKENS.bg.placeholder, badge: true, expiring: false },
    { label: '製品', color: TOKENS.accent.goldLighter, badge: false, expiring: false },
    {
      label: '来店',
      color: TOKENS.bg.placeholder,
      badge: true,
      expiring: true,
    },
  ]

  const diagnostics: DiagnosticItem[] = [
    { title: '髪質診断', date: data.diagnosticsLastDate?.hair || '', isUnread: false },
    { title: '頭皮診断', date: data.diagnosticsLastDate?.scalp || '', isUnread: false },
    { title: '白髪診断', date: data.diagnosticsLastDate?.gray || '', isUnread: false },
    { title: '今日の髪占い', date: '未読', isUnread: true },
  ]

  const barChartData = [
    { month: '4月', percent: 56, color: TOKENS.accent.goldLighter },
    { month: '5月', percent: 64, color: TOKENS.accent.goldLighter },
    { month: '6月', percent: 78, color: TOKENS.accent.goldLight },
    { month: '7月', percent: 94, color: TOKENS.accent.gold },
  ]

  const newsItems = [
    {
      title: '夏のトリートメントキャンペーン',
      date: '7/31まで',
      from: '山田さんより',
    },
    {
      title: '補修シャンプーが残り少なめです',
      date: '前回購入から2か月',
      from: '再購入へ',
    },
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: TOKENS.bg.main,
        fontFamily: 'var(--font-sans)',
        color: TOKENS.text.primary,
        paddingBottom: '80px',
      }}
    >
      {/* ヒーロー画像 */}
      <div
        style={{
          position: 'relative',
          height: '176px',
          overflow: 'hidden',
        }}
      >
        <img
          src="/miniapp-assets/home-hero.png"
          alt="hero"
          style={{
            width: '100%',
            height: 'auto',
            marginTop: '-32px',
            display: 'block',
          }}
        />
        {/* グラデーションオーバーレイ */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '74px',
            background: `linear-gradient(180deg, rgba(243,238,229,0), ${TOKENS.bg.main})`,
          }}
        />
        {/* ロゴ */}
        <img
          src="/miniapp-assets/logo-cut.png"
          alt="logo"
          style={{
            position: 'absolute',
            left: '16px',
            top: '6px',
            width: '74px',
          }}
        />
        {/* 設定ピル */}
        <div
          style={{
            position: 'absolute',
            right: '16px',
            top: '10px',
            background: 'rgba(255, 255, 255, 0.88)',
            borderRadius: '99px',
            padding: '7px 14px',
            fontSize: '10.5px',
            fontWeight: '700',
            color: TOKENS.text.gold,
          }}
        >
          設定
        </div>
      </div>

      {/* メインコンテンツ */}
      <div
        style={{
          padding: '0 18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          marginTop: '-14px',
        }}
      >
        {/* 挨拶ブロック */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-serif)',
              fontSize: '22px',
              lineHeight: '1.5',
              fontWeight: '500',
              color: TOKENS.text.primary,
            }}
          >
            おかえりなさい、
            <br />
            {data.userName}さんの髪のいま
          </h1>
          <span
            style={{
              fontSize: '11.5px',
              color: TOKENS.text.tertiary,
            }}
          >
            前回の施術から {data.lastVisitDaysAgo}日 ／ {data.nextAppointmentDate}{' '}
            {data.nextAppointmentTime} にご来店予定
          </span>
        </div>

        {/* 来店前のご相談カード */}
        <div
          style={{
            background: TOKENS.bg.card,
            borderRadius: '18px',
            padding: '17px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: `0 1px 0 ${TOKENS.border}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              来店前のご相談
            </span>
            <span style={{ fontSize: '10.5px', color: TOKENS.text.quaternary }}>
              未送信
            </span>
          </div>
          <div
            style={{
              height: '6px',
              borderRadius: '99px',
              background: TOKENS.bg.placeholder,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${data.karteCompletionPercent}%`,
                background: TOKENS.accent.gold,
                borderRadius: '99px',
              }}
            />
          </div>
          <span
            style={{
              fontSize: '11.5px',
              lineHeight: '1.8',
              color: TOKENS.text.secondary,
            }}
          >
            きろくから10項目を反映しました。あとは今回の希望を選ぶだけです。
          </span>
          <div
            style={{
              background: TOKENS.button.dark,
              color: '#fff',
              textAlign: 'center',
              borderRadius: '99px',
              padding: '14px',
              fontSize: '13px',
              fontWeight: '700',
            }}
          >
            事前カルテを仕上げる
          </div>
        </div>

        {/* 診断スコアカード */}
        <div
          style={{
            background: TOKENS.bg.card,
            borderRadius: '18px',
            padding: '17px',
            display: 'flex',
            flexDirection: 'column',
            gap: '13px',
            boxShadow: `0 1px 0 ${TOKENS.border}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              診断スコア
            </span>
            <span style={{ fontSize: '10.5px', color: TOKENS.text.quaternary }}>
              6/28 更新
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '10px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '36px',
                fontWeight: '500',
                lineHeight: '1',
                color: TOKENS.text.gold,
              }}
            >
              {data.karteScore}
            </span>
            <span
              style={{
                fontSize: '11.5px',
                color: TOKENS.text.secondary,
                paddingBottom: '5px',
              }}
            >
              髪質 ／ 前回 +{data.karteScoreChange}
            </span>
          </div>

          {/* 棒グラフ */}
          <div style={{ display: 'flex', gap: '5px', height: '56px' }}>
            {barChartData.map((bar, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    flex: 1,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'flex-end',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: `${bar.percent}%`,
                      background: bar.color,
                      borderRadius: '4px 4px 0 0',
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: '8.5px',
                    color: TOKENS.text.quaternary,
                    flex: 'none',
                  }}
                >
                  {bar.month}
                </span>
              </div>
            ))}
          </div>

          {/* スコア詳細 */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <div
              style={{
                flex: 1,
                background: TOKENS.bg.surface,
                borderRadius: '12px',
                padding: '10px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '11px', color: TOKENS.text.tertiary }}>
                頭皮
              </span>
              <span
                style={{
                  fontSize: '13.5px',
                  fontWeight: '700',
                  color: TOKENS.text.gold,
                }}
              >
                {data.scalpScore}
              </span>
            </div>
            <div
              style={{
                flex: 1,
                background: TOKENS.bg.surface,
                borderRadius: '12px',
                padding: '10px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '11px', color: TOKENS.text.tertiary }}>
                白髪
              </span>
              <span
                style={{
                  fontSize: '13.5px',
                  fontWeight: '700',
                  color: TOKENS.text.gold,
                }}
              >
                {data.grayScore}
              </span>
            </div>
          </div>
        </div>

        {/* きろくカード */}
        <div
          style={{
            background: TOKENS.bg.card,
            borderRadius: '18px',
            padding: '17px 0 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: `0 1px 0 ${TOKENS.border}`,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              padding: '0 17px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              きろく
            </span>
            <span
              style={{
                fontSize: '10.5px',
                color: TOKENS.text.quaternary,
              }}
            >
              {data.recordsCount}件 ／ すべて見る
            </span>
          </div>

          {/* グリッド */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '2px',
            }}
          >
            {tiles.map((tile, idx) => (
              <div
                key={idx}
                style={{
                  aspectRatio: '1',
                  background: tile.color,
                  position: 'relative',
                }}
              >
                {tile.badge && (
                  <span
                    style={{
                      position: 'absolute',
                      left: '5px',
                      bottom: '5px',
                      fontSize: '8px',
                      background: 'rgba(255, 255, 255, 0.88)',
                      color: TOKENS.text.gold,
                      borderRadius: '99px',
                      padding: '2px 6px',
                      fontWeight: '700',
                    }}
                  >
                    {tile.label}
                  </span>
                )}
                {tile.expiring && (
                  <span
                    style={{
                      position: 'absolute',
                      right: '5px',
                      top: '5px',
                      fontSize: '8px',
                      background: 'rgba(27, 24, 21, 0.72)',
                      color: '#fff',
                      borderRadius: '99px',
                      padding: '2px 6px',
                      fontWeight: '700',
                    }}
                  >
                    あと7日
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* 保存状況 */}
          <div
            style={{
              padding: '0 17px',
              display: 'flex',
              flexDirection: 'column',
              gap: '7px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <span
                style={{
                  fontSize: '11.5px',
                  color: TOKENS.text.secondary,
                }}
              >
                保存中の写真 {data.photosStored} / {data.photosLimit}枚
              </span>
              <span
                style={{
                  fontSize: '10.5px',
                  color: TOKENS.text.quaternary,
                }}
              >
                無料プラン（{data.storagePlanDays}日保存）
              </span>
            </div>
            <div
              style={{
                height: '6px',
                borderRadius: '99px',
                background: TOKENS.bg.placeholder,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(data.photosStored / data.photosLimit) * 100}%`,
                  background: TOKENS.accent.goldLight,
                  borderRadius: '99px',
                }}
              />
            </div>
            <span
              style={{
                fontSize: '10.5px',
                lineHeight: '1.7',
                color: TOKENS.text.quaternary,
              }}
            >
              保存期間を過ぎた写真は自動で削除されます
            </span>
          </div>

          {/* ボタン */}
          <div style={{ padding: '0 17px 17px', display: 'flex', gap: '8px' }}>
            <div
              style={{
                flex: 1,
                textAlign: 'center',
                border: `1px solid ${TOKENS.border}`,
                borderRadius: '99px',
                padding: '11px',
                fontSize: '12px',
              }}
            >
              写真を記録する
            </div>
            <div
              style={{
                flex: 1,
                textAlign: 'center',
                border: `1px solid ${TOKENS.border}`,
                borderRadius: '99px',
                padding: '11px',
                fontSize: '12px',
              }}
            >
              製品を登録
            </div>
          </div>
        </div>

        {/* 有料保存カード */}
        <div
          style={{
            background: TOKENS.bg.surfaceStrong,
            borderRadius: '18px',
            padding: '17px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              髪のアルバムを残す
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: TOKENS.text.gold,
              }}
            >
              ¥---
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '7px',
              fontSize: '11.5px',
              lineHeight: '1.7',
              color: TOKENS.text.secondary,
            }}
          >
            <div>写真を無期限で保存（枚数の上限なし）</div>
            <div>年単位で並べて比較できるビュー</div>
            <div>来店ごとのアルバムを美容師に共有</div>
          </div>
          <div
            style={{
              background: TOKENS.button.dark,
              color: '#fff',
              textAlign: 'center',
              borderRadius: '99px',
              padding: '13px',
              fontSize: '12.5px',
              fontWeight: '700',
            }}
          >
            プランを見る
          </div>
          <span
            style={{
              fontSize: '10px',
              lineHeight: '1.7',
              color: TOKENS.text.quaternary,
            }}
          >
            美容師に送った写真は、サロン側の記録として無料枠とは別に保管されます。
          </span>
        </div>

        {/* 診断・占いカード */}
        <div
          style={{
            background: TOKENS.bg.card,
            borderRadius: '18px',
            padding: '17px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: `0 1px 0 ${TOKENS.border}`,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            診断・占い
          </span>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              fontSize: '11.5px',
            }}
          >
            {diagnostics.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: TOKENS.bg.surface,
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                }}
              >
                <span style={{ fontWeight: '700' }}>{item.title}</span>
                <span
                  style={{
                    fontSize: '10px',
                    color: item.isUnread ? TOKENS.accent.gold : TOKENS.text.quaternary,
                  }}
                >
                  {item.isUnread ? item.date : `前回 ${item.date}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* サロンからのお知らせカード */}
        <div
          style={{
            background: TOKENS.bg.card,
            borderRadius: '18px',
            padding: '17px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: `0 1px 0 ${TOKENS.border}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              サロンからのお知らせ
            </span>
            <span
              style={{
                fontSize: '10.5px',
                color: TOKENS.text.quaternary,
              }}
            >
              2件
            </span>
          </div>

          {newsItems.map((news, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '11px', alignItems: 'center' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: TOKENS.bg.placeholder,
                  flex: 'none',
                }}
              />
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: '700' }}>
                  {news.title}
                </span>
                <span style={{ fontSize: '10.5px', color: TOKENS.text.tertiary }}>
                  {news.date} ／ {news.from}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* タブバー */}
      <div
        style={{
          display: 'flex',
          borderTop: `1px solid ${TOKENS.border}`,
          background: TOKENS.bg.card,
          padding: '10px 0 16px',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
        }}
      >
        {['ホーム', 'きろく', 'マイカルテ', 'サロン'].map((tab, idx) => (
          <div
            key={idx}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: '10px',
              fontWeight: idx === 0 ? '700' : 'normal',
              color: idx === 0 ? TOKENS.text.gold : TOKENS.text.quaternary,
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* タブバー分のスペーサー */}
      <div style={{ height: '60px' }} />
    </div>
  )
}
