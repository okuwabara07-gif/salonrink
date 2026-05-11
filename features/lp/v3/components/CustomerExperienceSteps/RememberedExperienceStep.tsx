'use client';

interface RememberedExperienceStepProps {
  profileId: 1 | 2 | 3;
  onNext: () => void;
}

const REMEMBERED_DATA: Record<1 | 2 | 3, {
  customerName: string;
  greeting: string;
  lastVisit: string;
  lastNote: string;
  personalization: string;
  feeling1: string;
  feeling2: string;
  message: string;
}> = {
  1: {
    customerName: 'みさき様',
    greeting: '「みさき様、お久しぶりです!」',
    lastVisit: '前回: グレージュ7トーン、結婚式準備',
    lastNote: 'お客様メモ: 「3ヶ月後 → 結婚式」',
    personalization: '「結婚式、もうすぐですよね?前回からのカラー、いい感じですか?ベース仕上げて、当日に向けて準備しましょうね!」',
    feeling1: '「えっ、覚えていてくれた!こんなにずっと大切にしてくれるなんて...」',
    feeling2: '「最初の来店で話したことも、覚えていてくれてる!もう、ここ以外考えられない...」',
    message: 'これが、AIと美容師さんが共演する、新しいサロン体験。一度きりのお客様ではなく、ずっと大切にされる「あなた」へ。',
  },
  2: {
    customerName: 'あゆみ様',
    greeting: '「あゆみ様、いつもありがとうございます!」',
    lastVisit: '前回: 敏感肌対応グレー系、自然な仕上がり',
    lastNote: 'お客様メモ: 「クレーム敏感肌、優しい薬剤必須」',
    personalization: '「今回も敏感肌対応で進めますね。白髪の出方を見ながら、自然に仕上げます。前回、肌トラブルなかったから、今回も同じアプローチで」',
    feeling1: '「毎回、アレルギーのこと新しく説明しなくていい...」',
    feeling2: '「施術中の会話も、自分のペースに合わせてくれてて。心が楽...」',
    message: 'これが、安心を積み重ねるサロン体験。あなたの肌、あなたのペースを、ずっと見守ってくれるパートナーとしてのサロン。',
  },
  3: {
    customerName: 'けんじ様',
    greeting: '「けんじさん、毎度です!」',
    lastVisit: '前回: ツーブロック短髪、朝スタイリング簡単',
    lastNote: 'お客様メモ: 「朝忙しい、セット簡単重視」',
    personalization: '「前回のツーブロック、いい感じですね。朝の準備も楽ですか?今回も同じラインで、もう少しシャープに調整してみましょう」',
    feeling1: '「あ、『朝の準備が楽か』って聞いてくれてる...」',
    feeling2: '「毎回、細かく調整してくれてる。このサロン、本当に顧客を見てる」',
    message: 'これが、信頼を築くサロン体験。時間がない人生だからこそ、あなたの生活に寄り添うサロン。',
  },
};

export default function RememberedExperienceStep({ profileId, onNext }: RememberedExperienceStepProps) {
  const data = REMEMBERED_DATA[profileId];

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
        2ヶ月後、再来店
      </h3>
      <p style={{
        fontSize: '14px',
        color: 'var(--c-fg-2)',
        marginTop: 0,
        marginBottom: 28,
      }}>
        あなたを、ずっと覚えていてくれます
      </p>

      {/* Timeline simulation */}
      <div style={{
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 24,
      }}>
        {/* 14:00 Greeting */}
        <div style={{
          marginBottom: 20,
          paddingBottom: 20,
          borderBottom: '1px solid #EEE',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 12,
          }}>
            <span style={{
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#06C755',
            }}>
              14:00
            </span>
            <span style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: 'var(--c-fg)',
            }}>
              来店
            </span>
          </div>
          <p style={{
            margin: 0,
            padding: 12,
            backgroundColor: 'white',
            borderRadius: 8,
            fontSize: '13px',
            color: '#333',
            fontStyle: 'italic',
          }}>
            美容師: {data.greeting}
          </p>
        </div>

        {/* 14:01 System check */}
        <div style={{
          marginBottom: 20,
          paddingBottom: 20,
          borderBottom: '1px solid #EEE',
          backgroundColor: '#F0F8F5',
          padding: 16,
          borderRadius: 8,
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#06C755',
            marginBottom: 8,
          }}>
            📋 サロン側の記録を確認
          </div>
          <div style={{
            fontSize: '12px',
            color: '#333',
            lineHeight: 1.6,
          }}>
            <div>✓ {data.lastVisit}</div>
            <div>✓ {data.lastNote}</div>
          </div>
        </div>

        {/* 14:02 Personalization */}
        <div style={{
          marginBottom: 20,
          paddingBottom: 20,
          borderBottom: '1px solid #EEE',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 12,
          }}>
            <span style={{
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#06C755',
            }}>
              14:02
            </span>
            <span style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: 'var(--c-fg)',
            }}>
              施術前カウンセリング
            </span>
          </div>
          <p style={{
            margin: 0,
            padding: 12,
            backgroundColor: 'white',
            borderRadius: 8,
            fontSize: '13px',
            color: '#333',
            fontStyle: 'italic',
          }}>
            美容師: {data.personalization}
          </p>
        </div>

        {/* Feeling 1 */}
        <div style={{
          marginBottom: 20,
          paddingBottom: 20,
          borderBottom: '1px solid #EEE',
        }}>
          <p style={{
            margin: 0,
            padding: 12,
            backgroundColor: '#FFF8DC',
            borderRadius: 8,
            fontSize: '13px',
            color: '#8B6914',
            fontStyle: 'italic',
            lineHeight: 1.6,
          }}>
            {data.feeling1}
          </p>
        </div>

        {/* During treatment */}
        <div style={{
          marginBottom: 20,
          paddingBottom: 20,
          borderBottom: '1px solid #EEE',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 12,
          }}>
            <span style={{
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#06C755',
            }}>
              14:30
            </span>
            <span style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: 'var(--c-fg)',
            }}>
              施術中の会話
            </span>
          </div>
          <p style={{
            margin: 0,
            padding: 12,
            backgroundColor: 'white',
            borderRadius: 8,
            fontSize: '13px',
            color: '#333',
            fontStyle: 'italic',
          }}>
            美容師: 「{data.customerName}のライフスタイルで必要なのは...」<br />
            (個別化された提案が続く)
          </p>
        </div>

        {/* Feeling 2 */}
        <div>
          <p style={{
            margin: 0,
            padding: 12,
            backgroundColor: '#FFF8DC',
            borderRadius: 8,
            fontSize: '13px',
            color: '#8B6914',
            fontStyle: 'italic',
            lineHeight: 1.6,
          }}>
            {data.feeling2}
          </p>
        </div>
      </div>

      {/* Message */}
      <div style={{
        marginTop: 28,
        padding: 20,
        backgroundColor: '#E8F5E9',
        borderRadius: 12,
      }}>
        <p style={{
          margin: 0,
          fontSize: '14px',
          color: '#1B5E20',
          lineHeight: 1.8,
          fontWeight: 500,
        }}>
          {data.message}
        </p>
      </div>

      {/* CTA */}
      <div style={{ marginTop: 28 }}>
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
          <span>▶</span> このサービスについて、もっと知る
        </button>
      </div>
    </div>
  );
}
