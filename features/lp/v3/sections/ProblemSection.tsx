'use client';

import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';
import ImageSlot from '@/features/lp/v3/components/ImageSlot';

const cardStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  background: 'var(--c-bg-card)',
  border: '1px solid var(--c-border-2)',
  borderRadius: 'var(--r-lg)',
  overflow: 'hidden',
  minHeight: 240,
  height: '100%',
};

const textColStyle: React.CSSProperties = {
  padding: '32px 28px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: 14,
};

const iconStyle: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 12,
  background: 'var(--c-accent-soft)',
  color: 'var(--c-accent-2)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const descStyle: React.CSSProperties = {
  color: 'var(--c-fg-3)',
  fontSize: 13,
  lineHeight: 1.85,
  margin: 0,
};

const imgColStyle: React.CSSProperties = {
  minHeight: 240,
  position: 'relative',
};

export default function ProblemSection() {
  return (
    <section className="section section-soft">
      <div className="container">
        <FadeUp>
          <div className="eyebrow" style={{ textAlign: 'center', display: 'block' }}>PROBLEM</div>
        </FadeUp>
        <FadeUp delay={80}>
          <h2 className="h2" style={{ marginTop: 14, textAlign: 'center' }}>
            毎日のサロンワーク、<br />
            こんな<span className="underline-accent">不安</span>ありませんか？
          </h2>
        </FadeUp>
        <FadeUp delay={140}>
          <p className="lede" style={{ textAlign: 'center', marginTop: 14, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
            多くの美容師さんが、日々の業務の中でこんな悩みを感じています。
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5" style={{ marginTop: 40 }}>
          {/* Card 1 — Full width top card */}
          <div className="md:col-span-2">
            <FadeUp delay={200}>
              <div style={cardStyle}>
                <div style={textColStyle}>
                  <span style={iconStyle}><Icon name="shield" size={20} /></span>
                  <h3 className="h3" style={{ fontSize: 22 }}>
                    施術前の確認、<br />本当にこれで大丈夫？
                  </h3>
                  <p style={descStyle}>
                    肌質や体調の情報を<br />毎回確認するのが不安...
                  </p>
                </div>
                <div style={imgColStyle}>
                  <ImageSlot id="problem-1" placeholder="problem-1" src="/v3/problem-1.png" alt="" />
                </div>
              </div>
            </FadeUp>
          </div>

          {/* Card 2 — Half width */}
          <FadeUp delay={280}>
            <div style={cardStyle}>
              <div style={textColStyle}>
                <span style={iconStyle}><Icon name="chat" size={20} /></span>
                <h3 className="h3" style={{ fontSize: 18 }}>
                  引き継ぎが<br />毎回バラバラ
                </h3>
                <p style={descStyle}>
                  口頭やメモだけの引き継ぎで、<br />伝え漏れがないかいつも不安...
                </p>
              </div>
              <div style={imgColStyle}>
                <ImageSlot id="problem-2" placeholder="problem-2" src="/v3/problem-2.png" alt="" />
              </div>
            </div>
          </FadeUp>

          {/* Card 3 — Half width */}
          <FadeUp delay={360}>
            <div style={cardStyle}>
              <div style={textColStyle}>
                <span style={iconStyle}><Icon name="folder" size={20} /></span>
                <h3 className="h3" style={{ fontSize: 18 }}>
                  LINE・紙・口頭管理で<br />情報が散らばる
                </h3>
                <p style={descStyle}>
                  お客様情報がバラバラで、<br />伝えるのに時間がかかり、<br />業務が止まってしまう...
                </p>
              </div>
              <div style={imgColStyle}>
                <ImageSlot id="problem-3" placeholder="problem-3" src="/v3/problem-3.png" alt="" />
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
