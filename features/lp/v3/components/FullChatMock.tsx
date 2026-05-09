'use client';

import Icon from './Icon';

const chipStyle: React.CSSProperties = {
  flex: 1,
  height: 36,
  borderRadius: 999,
  border: '1px solid #d8dde0',
  background: '#fff',
  fontSize: 13,
  fontWeight: 600,
  fontFamily: 'inherit',
};

export default function FullChatMock() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 4px 8px',
          borderBottom: '1px solid #d8dde0',
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        <span>SalonRink</span>
        <span>⋯</span>
      </div>
      <div className="chat-row them">
        <div className="bubble">カラー施術前のカウンセリング、ご回答ください 😊</div>
      </div>
      <div className="chat-row you">
        <div className="bubble you">アンケートを始める</div>
      </div>
      <div className="chat-row them">
        <div className="bubble">Q. 過去にカラーで頭皮にかゆみや赤みは出ましたか？</div>
      </div>
      <div style={{ display: 'flex', gap: 6, padding: '0 8px' }}>
        <button style={chipStyle}>はい</button>
        <button style={chipStyle}>いいえ</button>
      </div>
      <div className="ai-card">
        <div className="ai-tag">∨ AI分析結果</div>
        <div className="ai-warn">
          <span className="ai-warn-icon">!</span>事前カウンセリング情報の整理
        </div>
        <div style={{ fontSize: 11, color: 'var(--c-fg-3)', marginTop: 6, lineHeight: 1.7 }}>
          施術前にスタイリストにご相談ください。
        </div>
        <div
          style={{
            marginTop: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--c-accent-2)',
          }}
        >
          詳細を確認する <Icon name="arrowRight" size={12} stroke={2} />
        </div>
      </div>
    </div>
  );
}
