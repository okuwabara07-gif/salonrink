'use client';

interface BeforeSalonExperienceStepProps {
  profileId: 1 | 2 | 3;
  onNext: () => void;
}

export default function BeforeSalonExperienceStep({ profileId, onNext }: BeforeSalonExperienceStepProps) {
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
        ある日、いつものサロンへ
      </h3>
      <p style={{
        fontSize: '14px',
        color: 'var(--c-fg-2)',
        marginTop: 0,
        marginBottom: 32,
      }}>
        ここは、よくあるサロンの一日です
      </p>

      {/* Timeline */}
      <div style={{
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 24,
      }}>
        {/* Timeline item */}
        {[
          {
            time: '14:00',
            title: '来店',
            content: '「いらっしゃいませ!お名前と、今日のご希望を...」',
            detail: '(新人さんが iPad を見ながら聞く)',
          },
          {
            time: '14:05',
            title: 'カウンセリング開始',
            content: '「えーと、今日はどんな感じに?」',
            detail: '(毎回ゼロから質問される)',
          },
          {
            time: '14:15',
            title: 'ようやく決まる',
            content: '「お時間お待たせしました!」',
            detail: '(もう10分経過、施術はこれから)',
          },
          {
            time: '14:25',
            title: '施術中',
            content: '美容師: 「あ、前回どんなカラーでしたっけ?」',
            detail: 'あなた: 「えーと、たぶん...」',
          },
          {
            time: '15:40',
            title: '施術完了',
            content: '「次回はいつごろにしましょう?」',
            detail: '(次回提案はそのとき、目安なし)',
          },
          {
            time: '15:45',
            title: '帰宅',
            content: '心の声: 「うーん、悪くはないけど、毎回同じ説明が大変...」',
            detail: '(気分は 😐)',
          },
        ].map((item, idx) => (
          <div key={idx} style={{
            display: 'flex',
            gap: 16,
            marginBottom: idx < 5 ? 20 : 0,
            paddingBottom: idx < 5 ? 20 : 0,
            borderBottom: idx < 5 ? '1px solid #DDD' : 'none',
          }}>
            {/* Time badge */}
            <div style={{
              minWidth: 60,
              padding: '6px 10px',
              backgroundColor: 'white',
              border: '1px solid #CCC',
              borderRadius: 6,
              fontSize: '12px',
              fontWeight: 'bold',
              color: 'var(--c-fg)',
              textAlign: 'center',
              height: 'fit-content',
            }}>
              {item.time}
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <h4 style={{
                margin: '0 0 8px 0',
                fontSize: '14px',
                fontWeight: 'bold',
                color: 'var(--c-fg)',
              }}>
                {item.title}
              </h4>
              <p style={{
                margin: '0 0 6px 0',
                fontSize: '13px',
                color: 'var(--c-fg)',
                lineHeight: 1.5,
              }}>
                {item.content}
              </p>
              <p style={{
                margin: 0,
                fontSize: '12px',
                color: '#999',
              }}>
                {item.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom message and CTA */}
      <div style={{ marginTop: 28 }}>
        <p style={{
          fontSize: '14px',
          color: 'var(--c-fg-2)',
          marginTop: 0,
          marginBottom: 20,
        }}>
          これがいつものサロン。では、こうだったらどう?
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
          <span>▶</span> もう一歩進んだ体験へ
        </button>
      </div>
    </div>
  );
}
