'use client';

import { useState, useEffect } from 'react';
import Icon from './Icon';

type Props = {
  open: boolean;
  onClose: () => void;
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 56,
  borderRadius: 12,
  border: '1px solid var(--c-border)',
  padding: '0 18px',
  fontSize: 16,
  fontFamily: 'inherit',
  background: 'var(--c-bg-card)',
  color: 'var(--c-fg)',
  outline: 'none',
};

export default function CtaModal({ open, onClose }: Props) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!open) setTimeout(() => setStep(0), 300);
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <Icon name="x" />
        </button>
        <div className="eyebrow" style={{ fontSize: 11 }}>
          14日間無料 / クレカ不要
        </div>
        <h3 className="h2" style={{ fontSize: 24, marginTop: 6, marginBottom: 16 }}>
          {step === 0 && 'サロン名を教えてください'}
          {step === 1 && '規模を選んでください'}
          {step === 2 && '連絡先（LINE / メール）'}
        </h3>
        {step === 0 && (
          <>
            <input style={inputStyle} placeholder="例：BLOOM 表参道" />
            <button
              className="btn btn-primary btn-block btn-lg"
              style={{ marginTop: 16 }}
              onClick={() => setStep(1)}
            >
              次へ <Icon name="arrowRight" size={16} />
            </button>
          </>
        )}
        {step === 1 && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['1〜3名（個人）', '4〜10名（中規模）', '11名以上 / 複数店舗'].map((o) => (
                <button
                  key={o}
                  className="btn btn-ghost"
                  style={{ height: 56, justifyContent: 'flex-start' }}
                  onClick={() => setStep(2)}
                >
                  {o}
                </button>
              ))}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <input style={inputStyle} placeholder="LINE ID または メールアドレス" />
            <button
              className="btn btn-primary btn-block btn-lg"
              style={{ marginTop: 16 }}
              onClick={() => {
                alert('申込ありがとうございます（デモ）');
                onClose();
              }}
            >
              無料ではじめる
            </button>
          </>
        )}
      </div>
    </div>
  );
}
