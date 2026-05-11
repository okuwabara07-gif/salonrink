'use client';

import { useState } from 'react';

interface FormData {
  contact_name: string;
  email: string;
  phone?: string;
  salon_name?: string;
  salon_size?: string;
}

interface EmailFormStepProps {
  onSubmit: (formData: FormData) => void;
  isSubmitting: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailFormStep({
  onSubmit,
  isSubmitting,
}: EmailFormStepProps) {
  const [localForm, setLocalForm] = useState<FormData>({
    contact_name: '',
    email: '',
    phone: '',
    salon_name: '',
    salon_size: '',
  });

  const [errors, setErrors] = useState<{
    contact_name?: string;
    email?: string;
  }>({});

  const handleSubmit = () => {
    const newErrors: { contact_name?: string; email?: string } = {};

    if (!localForm.contact_name.trim()) {
      newErrors.contact_name = 'お名前を入力してください';
    }

    if (!localForm.email.trim()) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!EMAIL_REGEX.test(localForm.email)) {
      newErrors.email = '正しいメールアドレスを入力してください';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit(localForm);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <h2
          style={{
            fontSize: 'clamp(20px, 3.5vw, 26px)',
            fontWeight: 700,
            margin: '0 0 8px 0',
            color: 'var(--c-fg)',
            fontFamily: 'var(--f-display)',
          }}
        >
          資料を、あなたのメールへ
        </h2>
        <p
          style={{
            fontSize: 13,
            color: 'var(--c-fg-3)',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          あなたのサロンで SalonRink を始めるための、すべての情報をお送りします
        </p>
      </div>

      {/* Form Container */}
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        {/* お名前 */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--c-fg)',
              marginBottom: 8,
            }}
          >
            お名前 <span style={{ color: '#B91C1C' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="山田 太郎"
            value={localForm.contact_name}
            onChange={(e) => {
              setLocalForm({ ...localForm, contact_name: e.target.value });
              if (errors.contact_name) {
                setErrors({ ...errors, contact_name: undefined });
              }
            }}
            maxLength={50}
            style={{
              width: '100%',
              padding: 12,
              border:
                errors.contact_name && localForm.contact_name.trim() === ''
                  ? '1px solid #B91C1C'
                  : '1px solid var(--c-border)',
              borderRadius: 8,
              fontSize: 14,
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
              outline: 'none',
            }}
            onFocus={(e) => {
              if (!errors.contact_name) {
                e.currentTarget.style.borderColor = 'var(--c-accent)';
              }
            }}
            onBlur={(e) => {
              if (!errors.contact_name) {
                e.currentTarget.style.borderColor = 'var(--c-border)';
              }
            }}
          />
          {errors.contact_name && (
            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: 12,
                color: '#B91C1C',
              }}
            >
              {errors.contact_name}
            </p>
          )}
        </div>

        {/* メールアドレス */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--c-fg)',
              marginBottom: 8,
            }}
          >
            メールアドレス <span style={{ color: '#B91C1C' }}>*</span>
          </label>
          <input
            type="email"
            placeholder="your@example.com"
            value={localForm.email}
            onChange={(e) => {
              setLocalForm({ ...localForm, email: e.target.value });
              if (errors.email) {
                setErrors({ ...errors, email: undefined });
              }
            }}
            style={{
              width: '100%',
              padding: 12,
              border: errors.email ? '1px solid #B91C1C' : '1px solid var(--c-border)',
              borderRadius: 8,
              fontSize: 14,
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
              outline: 'none',
            }}
            onFocus={(e) => {
              if (!errors.email) {
                e.currentTarget.style.borderColor = 'var(--c-accent)';
              }
            }}
            onBlur={(e) => {
              if (!errors.email) {
                e.currentTarget.style.borderColor = 'var(--c-border)';
              }
            }}
          />
          {errors.email && (
            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: 12,
                color: '#B91C1C',
              }}
            >
              {errors.email}
            </p>
          )}
        </div>

        {/* サロン名 */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--c-fg)',
              marginBottom: 8,
            }}
          >
            サロン名
          </label>
          <input
            type="text"
            placeholder="○○ヘアサロン"
            value={localForm.salon_name || ''}
            onChange={(e) =>
              setLocalForm({ ...localForm, salon_name: e.target.value })
            }
            maxLength={100}
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid var(--c-border)',
              borderRadius: 8,
              fontSize: 14,
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--c-accent)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--c-border)';
            }}
          />
        </div>

        {/* サロン規模 */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--c-fg)',
              marginBottom: 8,
            }}
          >
            サロン規模
          </label>
          <select
            value={localForm.salon_size || ''}
            onChange={(e) =>
              setLocalForm({ ...localForm, salon_size: e.target.value })
            }
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid var(--c-border)',
              borderRadius: 8,
              fontSize: 14,
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
              outline: 'none',
              background: '#fff',
              cursor: 'pointer',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--c-accent)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--c-border)';
            }}
          >
            <option value="">選択してください</option>
            <option value="1人">1人</option>
            <option value="2-3人">2-3人</option>
            <option value="4人以上">4人以上</option>
            <option value="シェアサロン">シェアサロン</option>
          </select>
        </div>

        {/* 電話番号 */}
        <div style={{ marginBottom: 28 }}>
          <label
            style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--c-fg)',
              marginBottom: 8,
            }}
          >
            電話番号
          </label>
          <input
            type="tel"
            placeholder="090-1234-5678"
            value={localForm.phone || ''}
            onChange={(e) =>
              setLocalForm({ ...localForm, phone: e.target.value })
            }
            maxLength={20}
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid var(--c-border)',
              borderRadius: 8,
              fontSize: 14,
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--c-accent)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--c-border)';
            }}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '14px 24px',
            background: isSubmitting ? 'var(--c-fg-4)' : 'var(--c-accent)',
            color: 'var(--c-on-accent)',
            border: 'none',
            borderRadius: 999,
            fontSize: 16,
            fontWeight: 700,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
            boxShadow: isSubmitting
              ? 'none'
              : '0 4px 16px rgba(200, 163, 102, 0.2)',
            opacity: isSubmitting ? 0.7 : 1,
            marginBottom: 20,
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              (e.currentTarget as HTMLButtonElement).style.transform =
                'translateY(-2px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 8px 24px rgba(200, 163, 102, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) {
              (e.currentTarget as HTMLButtonElement).style.transform =
                'translateY(0)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 4px 16px rgba(200, 163, 102, 0.2)';
            }
          }}
        >
          {isSubmitting ? '送信中...' : '資料をメールで受け取る'}
        </button>

        {/* Notice */}
        <p
          style={{
            fontSize: 12,
            color: 'var(--c-fg-3)',
            lineHeight: 1.7,
            margin: 0,
            textAlign: 'center',
          }}
        >
          📧 ご入力のメールアドレスに、サービス資料(PDF)をお送りします。
          <br />
          メールにはステップメール(全3通)も含まれます。配信停止はいつでも可能です。
        </p>
      </div>
    </div>
  );
}
