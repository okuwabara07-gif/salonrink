'use client';

interface SalonReceivedDataStepProps {
  profileId: 1 | 2 | 3;
  onNext: () => void;
}

const SALON_DATA: Record<1 | 2 | 3, {
  customerName: string;
  concerns: string[];
  proposal: string;
  nextPlan: string;
  allergy: string;
  history: string;
  memo: string;
}> = {
  1: {
    customerName: 'みさき様',
    concerns: ['毛先のパサつきが気になる', 'グレージュ系で透明感を出したい', '3ヶ月後に結婚式予定、徐々に明るく'],
    proposal: 'グレージュ7トーン、毛先ダメージケア優先',
    nextPlan: '段階的に明るく(結婚式に向けて)',
    allergy: 'なし',
    history: '前回ブリーチあり',
    memo: '結婚式まで3ヶ月、計画的に / お肌は強い方',
  },
  2: {
    customerName: 'あゆみ様',
    concerns: ['白髪が目立つ', 'クレーム敏感肌なので優しい薬剤で', '自然な仕上がりで若々しく'],
    proposal: '薬剤: セミ, グレー系ナチュラル',
    nextPlan: '月1回ペースの継続推奨',
    allergy: 'あり(クレーム敏感肌)',
    history: '白髪染め継続中',
    memo: '敏感肌対応必須 / 自然な雰囲気を重視',
  },
  3: {
    customerName: 'けんじ様',
    concerns: ['スタイルが出ない', 'さっぱり清潔感のある短髪', '朝セット簡単なスタイルで'],
    proposal: 'ツーブロック短髪, 朝スタイリング簡単設計',
    nextPlan: '3週間ペースのカット推奨',
    allergy: 'なし',
    history: 'メンズ定期客',
    memo: '朝準備時間短いため、セット簡単重視 / 清潔感最優先',
  },
};

export default function SalonReceivedDataStep({ profileId, onNext }: SalonReceivedDataStepProps) {
  const data = SALON_DATA[profileId];

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
        サロン側には、こう届いています
      </h3>
      <p style={{
        fontSize: '14px',
        color: 'var(--c-fg-2)',
        marginTop: 0,
        marginBottom: 24,
      }}>
        事前にあなたを理解する、それがサロンの新しいスタンダード
      </p>

      {/* Data cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16,
        marginBottom: 28,
      }}>
        {/* Card 1: Customer Concerns */}
        <div style={{
          backgroundColor: '#FFF9E6',
          borderRadius: 12,
          padding: 20,
          borderLeft: '4px solid var(--c-accent)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'var(--c-fg)',
          }}>
            <span>📋</span> {data.customerName}のご希望
          </div>
          <ul style={{
            margin: 0,
            paddingLeft: 20,
            fontSize: '13px',
            color: 'var(--c-fg)',
            lineHeight: 1.7,
          }}>
            {data.concerns.map((concern, idx) => (
              <li key={idx}>{concern}</li>
            ))}
          </ul>
        </div>

        {/* Card 2: Styling Notes */}
        <div style={{
          backgroundColor: '#E8F5E9',
          borderRadius: 12,
          padding: 20,
          borderLeft: '4px solid #06C755',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'var(--c-fg)',
          }}>
            <span>✨</span> 今日の提案案
          </div>
          <p style={{
            margin: '0 0 12px 0',
            fontSize: '13px',
            color: 'var(--c-fg)',
            lineHeight: 1.6,
          }}>
            {data.proposal}
          </p>
          <div style={{
            padding: '10px 12px',
            backgroundColor: 'white',
            borderRadius: 6,
            fontSize: '12px',
            color: '#06C755',
            fontWeight: 'bold',
          }}>
            次回方針: {data.nextPlan}
          </div>
        </div>

        {/* Card 3: Safety Check */}
        <div style={{
          backgroundColor: '#FFEBEE',
          borderRadius: 12,
          padding: 20,
          borderLeft: '4px solid #E57373',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'var(--c-fg)',
          }}>
            <span>🛡️</span> 安全確認
          </div>
          <div style={{
            marginBottom: 10,
            fontSize: '13px',
            color: 'var(--c-fg)',
          }}>
            <strong>アレルギー:</strong> {data.allergy}
          </div>
          <div style={{
            fontSize: '13px',
            color: 'var(--c-fg)',
          }}>
            <strong>施術履歴:</strong> {data.history}
          </div>
        </div>

        {/* Card 4: Customer Memo */}
        <div style={{
          backgroundColor: '#F3E5F5',
          borderRadius: 12,
          padding: 20,
          borderLeft: '4px solid #9C27B0',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'var(--c-fg)',
          }}>
            <span>💭</span> 大事なこと
          </div>
          <div style={{
            margin: 0,
            fontSize: '13px',
            color: 'var(--c-fg)',
            lineHeight: 1.7,
          }}>
            {data.memo.split(' / ').map((line, idx) => (
              <div key={idx}>• {line}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom message and CTA */}
      <div>
        <p style={{
          fontSize: '14px',
          color: 'var(--c-fg-2)',
          marginTop: 0,
          marginBottom: 20,
        }}>
          美容師さんが、もう8割あなたを分かってる状態で待っています。
        </p>
        <button
          onClick={onNext}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 14,
            paddingBottom: 14,
            fontSize: '15px',
            fontWeight: 600,
            color: 'white',
            backgroundColor: '#06C755',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#05B84E';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#06C755';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span>▶</span> 当日、どう変わるか見てみる
        </button>
      </div>
    </div>
  );
}
