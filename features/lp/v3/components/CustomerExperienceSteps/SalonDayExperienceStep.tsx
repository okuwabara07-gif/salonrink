'use client';

interface SalonDayExperienceStepProps {
  profileId: 1 | 2 | 3;
  onNext: () => void;
}

const EXPERIENCE_COMPARISON: Record<1 | 2 | 3, {
  beforeTime: string;
  beforeItems: string[];
  beforeFeeling: string;
  afterTime: string;
  afterItems: string[];
  afterFeeling: string;
  benefit: string;
}> = {
  1: {
    beforeTime: '14:00 - 16:00 = 120分',
    beforeItems: ['14:00 来店、20分カウンセリング', '14:20 ようやく施術開始', '14:40 「前回どんな?」「えーと...」', '16:00 施術完了、慌ただしい'],
    beforeFeeling: '「悪くはないけど、毎回同じこと...」',
    afterTime: '14:00 - 15:30 = 90分',
    afterItems: ['14:00 来店、すぐに席へ', '14:05 もう希望は伝わっている', '14:10 施術開始(15分早い!)', '15:30 ゆったり仕上げ完了'],
    afterFeeling: '「私のこと、分かってくれてる」',
    benefit: '30分のゆとり。気持ちの満足。',
  },
  2: {
    beforeTime: '14:00 - 16:15 = 135分',
    beforeItems: ['14:00 来店、25分カウンセリング', '14:25 「敏感肌とのことですが...」詳しく聞き直し', '14:40 やっと施術開始', '16:15 完了、疲れた'],
    beforeFeeling: '「毎回、肌のことを説明するのが大変...」',
    afterTime: '14:00 - 15:45 = 105分',
    afterItems: ['14:00 来店、すぐに席へ', '14:05 敏感肌対応の話題が出ている', '14:10 施術開始、安心して任せられる', '15:45 丁寧な仕上げ完了'],
    afterFeeling: '「安心して、お任せできる」',
    benefit: '30分のゆとり。安心感。',
  },
  3: {
    beforeTime: '14:00 - 15:00 = 60分',
    beforeItems: ['14:00 来店', '14:05 「今日はどんな感じで?」から説明', '14:15 やっと施術開始', '15:00 急いで終了'],
    beforeFeeling: '「時間ない中で雑に終わった感...」',
    afterTime: '14:00 - 14:50 = 50分',
    afterItems: ['14:00 来店、すぐに席へ', '14:02 「前回のツーブロック、いい感じですね」', '14:05 施術開始、朝スタイリング簡単設計で提案', '14:50 完璧に完了'],
    afterFeeling: '「覚えてくれてて、信頼できる」',
    benefit: '10分短い。完成度が上がる。',
  },
};

export default function SalonDayExperienceStep({ profileId, onNext }: SalonDayExperienceStepProps) {
  const exp = EXPERIENCE_COMPARISON[profileId];

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
        当日。体験は、こう変わります
      </h3>
      <p style={{
        fontSize: '14px',
        color: 'var(--c-fg-2)',
        marginTop: 0,
        marginBottom: 28,
      }}>
        同じ時間でも、満足度がまったく違う
      </p>

      {/* Comparison grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 20,
        marginBottom: 28,
      }}>
        {/* Before */}
        <div style={{
          backgroundColor: '#F5F5F5',
          borderRadius: 12,
          padding: 24,
          borderTop: '4px solid #999',
        }}>
          <h4 style={{
            margin: '0 0 8px 0',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#666',
          }}>
            🥹 いつものサロン
          </h4>
          <p style={{
            margin: '0 0 16px 0',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#999',
          }}>
            {exp.beforeTime}
          </p>
          <ul style={{
            margin: '0 0 16px 0',
            paddingLeft: 20,
            fontSize: '13px',
            color: '#666',
            lineHeight: 1.8,
          }}>
            {exp.beforeItems.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
          <p style={{
            margin: 0,
            padding: '12px',
            backgroundColor: 'white',
            borderRadius: 8,
            fontSize: '13px',
            color: '#666',
            fontStyle: 'italic',
            lineHeight: 1.5,
          }}>
            {exp.beforeFeeling}
          </p>
        </div>

        {/* After */}
        <div style={{
          backgroundColor: '#E8F5E9',
          borderRadius: 12,
          padding: 24,
          borderTop: '4px solid #d4a574',
        }}>
          <h4 style={{
            margin: '0 0 8px 0',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#d4a574',
          }}>
            ✨ 事前カウンセリングサロン
          </h4>
          <p style={{
            margin: '0 0 16px 0',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#d4a574',
          }}>
            {exp.afterTime}
          </p>
          <ul style={{
            margin: '0 0 16px 0',
            paddingLeft: 20,
            fontSize: '13px',
            color: '#1B5E20',
            lineHeight: 1.8,
          }}>
            {exp.afterItems.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
          <p style={{
            margin: 0,
            padding: '12px',
            backgroundColor: 'white',
            borderRadius: 8,
            fontSize: '13px',
            color: '#1B5E20',
            fontStyle: 'italic',
            lineHeight: 1.5,
          }}>
            {exp.afterFeeling}
          </p>
        </div>
      </div>

      {/* Benefit callout */}
      <div style={{
        backgroundColor: 'var(--c-accent)',
        color: 'white',
        borderRadius: 12,
        padding: 20,
        textAlign: 'center',
        marginBottom: 28,
        fontSize: '16px',
        fontWeight: 'bold',
      }}>
        {exp.benefit}
      </div>

      {/* Bottom message and CTA */}
      <div>
        <p style={{
          fontSize: '14px',
          color: 'var(--c-fg-2)',
          marginTop: 0,
          marginBottom: 20,
        }}>
          でも、いちばん嬉しいのは次回も覚えていてくれること。
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
            backgroundColor: '#d4a574',
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
            e.currentTarget.style.backgroundColor = '#d4a574';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span>▶</span> 「覚えてくれる」を体験する
        </button>
      </div>
    </div>
  );
}
