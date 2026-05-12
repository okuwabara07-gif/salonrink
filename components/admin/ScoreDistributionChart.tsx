import { ScoreDistribution } from '@/lib/admin/dashboard-data'

interface ScoreDistributionChartProps {
  data: ScoreDistribution
}

export default function ScoreDistributionChart({ data }: ScoreDistributionChartProps) {
  const { gradeA, gradeB, gradeC, gradeD, total } = data

  // パーセンテージ計算
  const getPercent = (count: number) => (total === 0 ? 0 : Math.round((count / total) * 100))
  const percentA = getPercent(gradeA)
  const percentB = getPercent(gradeB)
  const percentC = getPercent(gradeC)
  const percentD = getPercent(gradeD)

  // グラフ用の累積角度計算(円グラフ)
  const getStartAngle = (prevCount: number) => (prevCount / total) * 360
  const getArcAngle = (count: number) => (count / total) * 360

  const startAngleA = 0
  const arcAngleA = getArcAngle(gradeA)

  const startAngleB = startAngleA + arcAngleA
  const arcAngleB = getArcAngle(gradeB)

  const startAngleC = startAngleB + arcAngleB
  const arcAngleC = getArcAngle(gradeC)

  const startAngleD = startAngleC + arcAngleC
  const arcAngleD = getArcAngle(gradeD)

  // SVG パス生成関数
  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    }
  }

  const describeArc = (
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ) => {
    const start = polarToCartesian(x, y, radius, endAngle)
    const end = polarToCartesian(x, y, radius, startAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

    return [
      `M ${x} ${y}`,
      `L ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
      'Z',
    ].join(' ')
  }

  const centerX = 120
  const centerY = 120
  const radius = 80

  const grades = [
    {
      label: 'A (80+)',
      value: gradeA,
      percent: percentA,
      color: '#10B981',
      startAngle: startAngleA,
      endAngle: startAngleA + arcAngleA,
    },
    {
      label: 'B (40-79)',
      value: gradeB,
      percent: percentB,
      color: '#3B82F6',
      startAngle: startAngleB,
      endAngle: startAngleB + arcAngleB,
    },
    {
      label: 'C (0-39)',
      value: gradeC,
      percent: percentC,
      color: '#F59E0B',
      startAngle: startAngleC,
      endAngle: startAngleC + arcAngleC,
    },
    {
      label: 'D (特殊)',
      value: gradeD,
      percent: percentD,
      color: '#6B7280',
      startAngle: startAngleD,
      endAngle: startAngleD + arcAngleD,
    },
  ]

  return (
    <div
      style={{
        background: '#1A1A1A',
        border: '1px solid #333',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        marginBottom: '40px',
      }}
    >
      <h3
        style={{
          fontSize: '18px',
          fontWeight: 700,
          color: '#fff',
          margin: '0 0 24px 0',
        }}
      >
        📊 スコア分布 (A/B/C/D)
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          alignItems: 'center',
        }}
      >
        {/* 左: 円グラフ */}
        <div style={{ textAlign: 'center' }}>
          <svg viewBox="0 0 240 240" style={{ width: '200px', height: '200px' }}>
            {grades.map((grade) =>
              grade.value > 0 ? (
                <path
                  key={grade.label}
                  d={describeArc(centerX, centerY, radius, grade.startAngle, grade.endAngle)}
                  fill={grade.color}
                  opacity="0.9"
                  stroke="#0f0f0f"
                  strokeWidth="2"
                />
              ) : null
            )}
          </svg>
          <p
            style={{
              marginTop: '12px',
              fontSize: '14px',
              color: '#999',
            }}
          >
            合計: <strong style={{ color: '#fff', fontSize: '16px' }}>{total}</strong> リード
          </p>
        </div>

        {/* 右: 凡例 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {grades.map((grade) => (
            <div
              key={grade.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: '#0f0f0f',
                borderRadius: '8px',
                borderLeft: `4px solid ${grade.color}`,
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '2px',
                  background: grade.color,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: grade.color,
                    marginBottom: '2px',
                  }}
                >
                  {grade.label}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {grade.value} 件 ({grade.percent}%)
                </div>
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: grade.color,
                }}
              >
                {grade.percent}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 説明 */}
      <div
        style={{
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #333',
          fontSize: '12px',
          color: '#666',
          lineHeight: '1.6',
        }}
      >
        <p style={{ margin: '0 0 8px 0' }}>
          <strong style={{ color: '#10B981' }}>A (ホット)</strong>
          {' - スコア 80+: 直ぐに対応すべき高速度リード'}
        </p>
        <p style={{ margin: '0 0 8px 0' }}>
          <strong style={{ color: '#3B82F6' }}>B (育成中)</strong>
          {' - スコア 40-79: ステップメール・定期接触で育成'}
        </p>
        <p style={{ margin: '0 0 8px 0' }}>
          <strong style={{ color: '#F59E0B' }}>C (コールド)</strong>
          {' - スコア 0-39: リマーケティング対象'}
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: '#6B7280' }}>D (特殊)</strong>
          {' - 配信停止・その他特殊ケース'}
        </p>
      </div>
    </div>
  )
}
