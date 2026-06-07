'use client';

import { useState, useEffect } from 'react';

interface PreCounselingExperienceStepProps {
  profileId: 1 | 2 | 3;
  onNext: () => void;
}

const COUNSELING_DATA: Record<1 | 2 | 3, {
  q1: string;
  q1_choices: string[];
  q1_selected: string;
  q2: string;
  q2_answer: string;
  q3: string;
  q3_answer: string;
}> = {
  1: {
    q1: '今気になっているお悩みは?',
    q1_choices: ['毛先のパサつき', '髪のうねり', '色落ち', 'ボリューム不足'],
    q1_selected: '毛先のパサつき',
    q2: '今回ご希望のスタイルは?',
    q2_answer: 'グレージュ系で透明感のあるカラーがいいです✨',
    q3: '最後にひと言、なんでも!',
    q3_answer: '3ヶ月後に結婚式があって、徐々に明るくしていきたいです💍',
  },
  2: {
    q1: '今気になっているお悩みは?',
    q1_choices: ['白髪が目立つ', '頭皮がかゆい', 'ダメージが気になる', 'うねりが出た'],
    q1_selected: '白髪が目立つ',
    q2: '頭皮や肌に不安なことは?',
    q2_answer: 'クレーム敏感肌なので、優しい薬剤でお願いします',
    q3: 'その他ご希望',
    q3_answer: '自然な仕上がりで、若々しく見えるといいです',
  },
  3: {
    q1: '今気になっているお悩みは?',
    q1_choices: ['寝癖', 'スタイルが出ない', 'もみあげがうっとうしい', '全体的にまとめたい'],
    q1_selected: 'スタイルが出ない',
    q2: '理想のスタイルは?',
    q2_answer: 'さっぱり、清潔感のある短髪でお願いします',
    q3: '時間制限',
    q3_answer: '朝が忙しいので、朝セット簡単なスタイルでお願い',
  },
};

export default function PreCounselingExperienceStep({ profileId, onNext }: PreCounselingExperienceStepProps) {
  const data = COUNSELING_DATA[profileId];
  const [displayedMessages, setDisplayedMessages] = useState<string[]>([]);
  const [allShown, setAllShown] = useState(false);

  useEffect(() => {
    const messages = [
      'from_salon',
      'from_salon_greeting',
      'q1_intro',
      'customer_choice',
      'q2_intro',
      'customer_answer2',
      'q3_intro',
      'customer_answer3',
      'salon_closing',
    ];

    let messageIndex = 0;
    const interval = setInterval(() => {
      if (messageIndex < messages.length) {
        setDisplayedMessages((prev) => [...prev, messages[messageIndex]]);
        messageIndex++;
      } else {
        clearInterval(interval);
        setAllShown(true);
        setTimeout(onNext, 3000);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [onNext]);

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
        来店3日前。LINEで「事前カウンセリング」が届きました
      </h3>
      <p style={{
        fontSize: '14px',
        color: 'var(--c-fg-2)',
        marginTop: 0,
        marginBottom: 24,
      }}>
        実は、答えるだけで体験が変わります
      </p>

      {/* LINE-style chat */}
      <div style={{
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        padding: 16,
        minHeight: 300,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        fontFamily: 'sans-serif',
      }}>
        {/* Salon greeting */}
        {displayedMessages.includes('from_salon') && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px 16px 4px 16px',
            padding: '10px 14px',
            maxWidth: '75%',
            fontSize: '13px',
            lineHeight: 1.5,
            color: '#333',
          }}>
            こんにちは、サロン側のメッセージです!<br />
            事前カウンセリングにご協力ください
          </div>
        )}

        {displayedMessages.includes('from_salon_greeting') && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px 16px 4px 16px',
            padding: '10px 14px',
            maxWidth: '75%',
            fontSize: '13px',
            lineHeight: 1.5,
            color: '#333',
          }}>
            {data.q1}
          </div>
        )}

        {displayedMessages.includes('q1_intro') && (
          <div style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}>
            {data.q1_choices.map((choice, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: choice === data.q1_selected ? '#d4a574' : 'white',
                  color: choice === data.q1_selected ? 'white' : '#333',
                  borderRadius: '16px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  border: choice === data.q1_selected ? 'none' : '1px solid #DDD',
                  textAlign: 'center',
                }}
              >
                {choice}
              </div>
            ))}
          </div>
        )}

        {displayedMessages.includes('customer_choice') && (
          <div style={{
            backgroundColor: '#d4a574',
            color: 'white',
            borderRadius: '16px 4px 16px 16px',
            padding: '10px 14px',
            maxWidth: '75%',
            marginLeft: 'auto',
            fontSize: '13px',
            lineHeight: 1.5,
          }}>
            {data.q1_selected} ✓
          </div>
        )}

        {displayedMessages.includes('q2_intro') && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px 16px 4px 16px',
            padding: '10px 14px',
            maxWidth: '75%',
            fontSize: '13px',
            lineHeight: 1.5,
            color: '#333',
          }}>
            {data.q2}
          </div>
        )}

        {displayedMessages.includes('customer_answer2') && (
          <div style={{
            backgroundColor: '#d4a574',
            color: 'white',
            borderRadius: '16px 4px 16px 16px',
            padding: '10px 14px',
            maxWidth: '75%',
            marginLeft: 'auto',
            fontSize: '13px',
            lineHeight: 1.5,
          }}>
            {data.q2_answer}
          </div>
        )}

        {displayedMessages.includes('q3_intro') && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px 16px 4px 16px',
            padding: '10px 14px',
            maxWidth: '75%',
            fontSize: '13px',
            lineHeight: 1.5,
            color: '#333',
          }}>
            {data.q3}
          </div>
        )}

        {displayedMessages.includes('customer_answer3') && (
          <div style={{
            backgroundColor: '#d4a574',
            color: 'white',
            borderRadius: '16px 4px 16px 16px',
            padding: '10px 14px',
            maxWidth: '75%',
            marginLeft: 'auto',
            fontSize: '13px',
            lineHeight: 1.5,
          }}>
            {data.q3_answer}
          </div>
        )}

        {displayedMessages.includes('salon_closing') && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px 16px 4px 16px',
            padding: '10px 14px',
            maxWidth: '75%',
            fontSize: '13px',
            lineHeight: 1.5,
            color: '#333',
          }}>
            ありがとうございます! 当日、ぴったりのご提案を準備してお待ちしてます!
          </div>
        )}
      </div>

      {/* Bottom message */}
      <div style={{ marginTop: 24 }}>
        <p style={{
          fontSize: '14px',
          color: 'var(--c-fg-2)',
          margin: '0 0 16px 0',
        }}>
          1分で完了。当日のカウンセリングが、もうほぼ要らない状態に。
        </p>
        {allShown && (
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
            <span>▶</span> サロン側に届く情報を見てみる
          </button>
        )}
      </div>
    </div>
  );
}
