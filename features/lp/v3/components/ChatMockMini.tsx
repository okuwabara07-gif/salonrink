'use client';

import Icon from './Icon';

export default function ChatMockMini() {
  return (
    <div className="chat-mock" style={{ fontSize: 11 }}>
      <div className="chat-head">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="arrowRight" size={12} stroke={2} style={{ transform: 'rotate(180deg)' }} />
          SalonRink
        </span>
        <span style={{ color: '#6b6256' }}>⋯</span>
      </div>
      <div className="chat-row them">
        <div className="bubble">カラー施術前のカウンセリングご回答ください 😊</div>
      </div>
      <div className="chat-row you">
        <div className="bubble you">アンケートを始める</div>
      </div>
      <div className="chat-row them">
        <div className="bubble">Q. 過去にカラーで頭皮にかゆみや赤みは出ましたか？</div>
      </div>
      <div className="chat-row them">
        <div className="chip-pair" style={{ width: '100%' }}>
          <button>はい</button>
          <button>いいえ</button>
        </div>
      </div>
      <div className="ai-card">
        <div className="ai-tag">∨ AI分析結果</div>
        <div className="ai-warn">
          <span className="ai-warn-icon">!</span>事前カウンセリング情報の整理
        </div>
        <div style={{ fontSize: 10.5, color: 'var(--c-fg-3)', marginTop: 6, lineHeight: 1.6 }}>
          施術前にスタイリストにご相談ください。
        </div>
      </div>
    </div>
  );
}
