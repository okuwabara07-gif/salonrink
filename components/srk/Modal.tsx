'use client';

import React, { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  width?: number;
}

export function Modal({ open, onClose, title, children, width = 480 }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="srk-modal-bg" onClick={onClose}>
      <div className="srk-modal" style={{ width }} onClick={(e) => e.stopPropagation()}>
        <header className="srk-modal-h">
          <h3>{title}</h3>
          <button className="srk-iconbtn ghost" onClick={onClose} type="button" aria-label="閉じる">
            ✕
          </button>
        </header>
        <div className="srk-modal-b">{children}</div>
      </div>
    </div>
  );
}
