'use client';

import { useState } from 'react';

interface CustomerCompletedStepProps {
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  onReset?: () => void;
  isSubmitting: boolean;
  formData: any;
  setFormData: any;
  errorMessage: string;
}

export default function CustomerCompletedStep({
  onSubmit,
  onClose,
  onReset,
  isSubmitting,
  formData,
  setFormData,
  errorMessage,
}: CustomerCompletedStepProps) {
  const [selectedOption, setSelectedOption] = useState<'referral' | 'b2b' | null>(null);

  const handleReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contact_name || !formData.email) {
      alert('お名前とメールアドレスを入力してください');
      return;
    }
    await onSubmit(formData);
  };

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
        あなたが感じた違い、サロンと共有しませんか?
      </h3>
      <p style={{
        fontSize: '14px',
        color: 'var(--c-fg-2)',
        marginTop: 0,
        marginBottom: 28,
      }}>
        新しい体験を、あなたの大切なサロンにも
      </p>

      {/* Two CTA options */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20,
        marginBottom: 28,
      }}>
        {/* Option A: Customer Referral */}
        <div style={{
          padding: 20,
          backgroundColor: selectedOption === 'referral' ? '#E8F5E9' : '#F9F9F9',
          borderRadius: 12,
          border: selectedOption === 'referral' ? '2px solid #d4a574' : '2px solid #EEE',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onClick={() => setSelectedOption('referral')}
        >
          <div style={{
            fontSize: '20px',
            marginBottom: 12,
          }}>
            🌸
          </div>
          <h4 style={{
            margin: '0 0 8px 0',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#d4a574',
          }}>
            通っているサロンに、この体験を伝えたい
          </h4>
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: '#666',
            lineHeight: 1.6,
          }}>
            メールアドレスを入力いただければ、サロン様向けの資料をお送りさせていただきます。
          </p>
        </div>

        {/* Option B: B2B */}
        <div style={{
          padding: 20,
          backgroundColor: selectedOption === 'b2b' ? '#FFF9E6' : '#F9F9F9',
          borderRadius: 12,
          border: selectedOption === 'b2b' ? '2px solid var(--c-accent)' : '2px solid #EEE',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onClick={() => setSelectedOption('b2b')}
        >
          <div style={{
            fontSize: '20px',
            marginBottom: 12,
          }}>
            💼
          </div>
          <h4 style={{
            margin: '0 0 8px 0',
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'var(--c-accent)',
          }}>
            サロン経営者の方はこちら
          </h4>
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: '#666',
            lineHeight: 1.6,
          }}>
            14日間無料で試してみませんか?
          </p>
        </div>
      </div>

      {/* Referral Form */}
      {selectedOption === 'referral' && (
        <form onSubmit={handleReferralSubmit} style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 'bold',
              marginBottom: 6,
              color: 'var(--c-fg)',
            }}>
              お名前 *
            </label>
            <input
              type="text"
              value={formData.contact_name}
              onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
              placeholder="例: 山田太郎"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #DDD',
                borderRadius: 6,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 'bold',
              marginBottom: 6,
              color: 'var(--c-fg)',
            }}>
              メールアドレス *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@salon.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #DDD',
                borderRadius: 6,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 'bold',
              marginBottom: 6,
              color: 'var(--c-fg)',
            }}>
              通っているサロン名 (任意)
            </label>
            <input
              type="text"
              value={formData.salon_name || ''}
              onChange={(e) => setFormData({ ...formData, salon_name: e.target.value })}
              placeholder="例: ◯◯ヘアサロン"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #DDD',
                borderRadius: 6,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 'bold',
              marginBottom: 6,
              color: 'var(--c-fg)',
            }}>
              サロンへのメッセージ (任意)
            </label>
            <textarea
              value={formData.message || ''}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="例: このサービス、ぜひ導入してください!感動しました!"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #DDD',
                borderRadius: 6,
                minHeight: 80,
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {errorMessage && (
            <div style={{
              padding: 12,
              backgroundColor: '#FFEBEE',
              color: '#C62828',
              borderRadius: 6,
              fontSize: '13px',
              marginBottom: 16,
            }}>
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '15px',
              fontWeight: 'bold',
              color: 'white',
              backgroundColor: isSubmitting ? '#CCC' : '#d4a574',
              border: 'none',
              borderRadius: 8,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = '#05B84E';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = '#d4a574';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {isSubmitting ? '送信中...' : '資料を送付してもらう'}
          </button>

          <p style={{
            marginTop: 12,
            fontSize: '12px',
            color: '#999',
            textAlign: 'center',
          }}>
            サロン様向けの資料を、サロンに代わりに送らせていただきます
          </p>
        </form>
      )}

      {/* B2B CTA */}
      {selectedOption === 'b2b' && (
        <div style={{ marginBottom: 24 }}>
          <a
            href="/signup"
            style={{
              display: 'block',
              padding: '16px',
              backgroundColor: 'var(--c-accent)',
              color: 'white',
              textAlign: 'center',
              borderRadius: 8,
              fontSize: '16px',
              fontWeight: 'bold',
              textDecoration: 'none',
              marginBottom: 12,
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#B8860B';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--c-accent)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            14日間無料で試す →
          </a>
          <p style={{
            margin: 0,
            fontSize: '12px',
            color: '#999',
            textAlign: 'center',
            lineHeight: 1.6,
          }}>
            このサービスは、サロン経営者様向けのサブスクリプションです。<br />
            お客様自身がご契約いただくサービスではありません。<br />
            良かったら、いつもお世話になっているサロンに、ぜひお伝えください!
          </p>
        </div>
      )}

      {/* Footer actions */}
      <div style={{
        display: 'flex',
        gap: 12,
        justifyContent: 'center',
        marginTop: 28,
        paddingTop: 20,
        borderTop: '1px solid #EEE',
      }}>
        <button
          onClick={onReset}
          style={{
            padding: '10px 20px',
            backgroundColor: 'white',
            border: '1px solid #DDD',
            borderRadius: 6,
            fontSize: '13px',
            color: '#666',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F5F5F5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
          }}
        >
          🔄 別のお客様で、もう一度体験する
        </button>
        <button
          onClick={onClose}
          style={{
            padding: '10px 20px',
            backgroundColor: 'white',
            border: '1px solid #DDD',
            borderRadius: 6,
            fontSize: '13px',
            color: '#666',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F5F5F5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
          }}
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
