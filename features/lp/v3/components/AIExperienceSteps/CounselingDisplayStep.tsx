'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  who: 'stylist' | 'customer';
  text: string;
}

interface CounselingDisplayStepProps {
  profileId: 1 | 2 | 3;
  onNext: () => void;
}

const COUNSELING_MESSAGES: Record<1 | 2 | 3, Message[]> = {
  1: [
    {
      who: 'stylist',
      text: 'こんにちは!次回のご来店、楽しみにしています。事前にいくつかご質問させてください',
    },
    { who: 'customer', text: 'よろしくお願いします!' },
    { who: 'stylist', text: '今の髪の状態でお悩みは?' },
    {
      who: 'customer',
      text: '毛先のパサつきが気になります...前回のブリーチで痛みも気になっています',
    },
    { who: 'stylist', text: '今回のご希望スタイルを教えてください' },
    { who: 'customer', text: '透明感のあるグレーカラーをやりたいです✨' },
    { who: 'stylist', text: '最後に、何か特別な日があれば教えてください' },
    { who: 'customer', text: '実は3ヶ月後に結婚式の予定があって...' },
  ],
  2: [
    {
      who: 'stylist',
      text: 'こんにちは、ご来店ありがとうございます。今のお悩みを教えてください',
    },
    { who: 'customer', text: '白髪が気になってきて...頭皮の乾燥も気になります' },
    { who: 'stylist', text: 'ご希望のスタイルは?' },
    { who: 'customer', text: '白髪ぼかしハイライト、自然な感じが好きです' },
    { who: 'stylist', text: '過去にアレルギー反応はありましたか?' },
    {
      who: 'customer',
      text: 'はい、PPDAで陽性反応が出たことがあります',
    },
    { who: 'stylist', text: '承知しました。安心の薬剤を選定します' },
    {
      who: 'customer',
      text: 'ありがとうございます。あ、もうすぐ子供が小学校入学なんです',
    },
  ],
  3: [
    {
      who: 'stylist',
      text: 'こんにちは、お待ちしてます。今気になっていることはありますか?',
    },
    { who: 'customer', text: 'くせ毛で、朝のスタイリングに時間がかかっています' },
    { who: 'stylist', text: 'ご希望のスタイルは?' },
    {
      who: 'customer',
      text: '清潔感のある暗髪で、クライアント対応で第一印象を大事にしたいです',
    },
    { who: 'stylist', text: 'お仕事柄、メンテナンスのご希望は?' },
    { who: 'customer', text: '月1回で通えるとうれしいです' },
    { who: 'stylist', text: '了解です。最近何か始めたこととかありますか?' },
    {
      who: 'customer',
      text: '実はジムに通い始めて、汗をかくのでケアも気になります',
    },
  ],
};

export default function CounselingDisplayStep({
  profileId,
  onNext,
}: CounselingDisplayStepProps) {
  const [displayedCount, setDisplayedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const allMessages = COUNSELING_MESSAGES[profileId];

  // メッセージを順次表示
  useEffect(() => {
    if (displayedCount >= allMessages.length) {
      setIsComplete(true);
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedCount((prev) => prev + 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [displayedCount, allMessages.length]);

  // 全メッセージ表示完了後、3秒待機してカウントダウン、その後onNext呼び出し
  useEffect(() => {
    if (!isComplete) return;

    const waitTimer = setTimeout(() => {
      // カウントダウン開始: 3 -> 2 -> 1 -> 0
      setCountdown(3);
    }, 500);

    return () => clearTimeout(waitTimer);
  }, [isComplete]);

  // カウントダウン処理
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      onNext();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onNext]);

  // スクロール位置を自動調整
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [displayedCount]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <h2
          style={{
            fontSize: 'clamp(20px, 3.5vw, 26px)',
            fontWeight: 700,
            margin: '0 0 8px 0',
            color: 'var(--c-fg)',
            fontFamily: 'var(--f-display)',
          }}
        >
          お客様の LINE 回答が届きました
        </h2>
        <p
          style={{
            fontSize: 13,
            color: 'var(--c-fg-3)',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          事前カウンセリングは、お客様にも美容師さんにも、ゆとりを生みます
        </p>
      </div>

      {/* LINE風メッセージエリア */}
      <div
        ref={messagesRef}
        style={{
          background: '#f8f7f4',
          borderRadius: 12,
          padding: 20,
          minHeight: 360,
          maxHeight: 480,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          marginBottom: 24,
        }}
      >
        {allMessages.slice(0, displayedCount).map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent:
                msg.who === 'stylist' ? 'flex-start' : 'flex-end',
              animation: `slideIn 0.3s ease-out`,
            }}
          >
            <div
              style={{
                maxWidth: '75%',
                padding: '12px 16px',
                borderRadius:
                  msg.who === 'stylist' ? '16px 16px 12px 4px' : '16px 16px 4px 12px',
                background:
                  msg.who === 'stylist'
                    ? 'rgba(255, 255, 255, 0.95)'
                    : '#7DCEA0',
                color: msg.who === 'stylist' ? 'var(--c-fg)' : '#fff',
                fontSize: 14,
                lineHeight: 1.6,
                boxShadow:
                  msg.who === 'stylist'
                    ? '0 1px 2px rgba(0, 0, 0, 0.05)'
                    : '0 2px 8px rgba(125, 206, 160, 0.2)',
                wordBreak: 'break-word',
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* 全メッセージ表示完了後のメッセージ */}
        {isComplete && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 16,
              animation: `fadeIn 0.5s ease-in`,
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: 'var(--c-fg-3)',
                textAlign: 'center',
              }}
            >
              ↓ AI が整理を始めます...
              {countdown !== null && (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'var(--c-accent)',
                  }}
                >
                  {countdown}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* アニメーション定義 */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
