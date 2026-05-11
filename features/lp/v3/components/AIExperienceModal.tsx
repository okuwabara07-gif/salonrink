'use client';

import { useState } from 'react';
import ProfileSelectStep from './AIExperienceSteps/ProfileSelectStep';
import CounselingDisplayStep from './AIExperienceSteps/CounselingDisplayStep';
import AILoadingStep from './AIExperienceSteps/AILoadingStep';
import KarteDisplayStep from './AIExperienceSteps/KarteDisplayStep';
import BeforeAfterStep from './AIExperienceSteps/BeforeAfterStep';
import EmailFormStep from './AIExperienceSteps/EmailFormStep';
import CompletedStep from './AIExperienceSteps/CompletedStep';

type Step =
  | 'profile_select'
  | 'counseling_display'
  | 'ai_loading'
  | 'karte_display'
  | 'before_after'
  | 'email_form'
  | 'completed';

interface FormData {
  contact_name: string;
  email: string;
  phone?: string;
  salon_name?: string;
  salon_size?: string;
}

interface AIExperienceModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AIExperienceModal({
  open,
  onClose,
}: AIExperienceModalProps) {
  const [step, setStep] = useState<Step>('profile_select');
  const [selectedProfileId, setSelectedProfileId] = useState<1 | 2 | 3 | null>(
    null
  );
  const [karteResult, setKarteResult] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    contact_name: '',
    email: '',
    phone: '',
    salon_name: '',
    salon_size: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleProfileSelect = (profileId: 1 | 2 | 3) => {
    setSelectedProfileId(profileId);
    setErrorMessage(null);
    setStep('counseling_display');
  };

  const handleCounselingComplete = () => {
    setStep('ai_loading');
    fetchKarte(selectedProfileId!);
  };

  const fetchKarte = async (profileId: 1 | 2 | 3) => {
    try {
      const res = await fetch('/api/ai-experience/generate-karte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profileId }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate karte');
      }

      const data = await res.json();
      setKarteResult(data.karte);
      setStep('karte_display');
    } catch (err) {
      console.error('fetchKarte error:', err);
      setErrorMessage('AI解析がタイムアウトしました');
      setStep('profile_select');
    }
  };

  const handleKarteNext = () => {
    setStep('before_after');
  };

  const handleBeforeAfterNext = () => {
    setStep('email_form');
  };

  const handleEmailSubmit = async (formDataInput: FormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/lead-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cta_type: 'ai_experience',
          source: 'hero_ai_experience',
          ai_experience_result: karteResult,
          ...formDataInput,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        setErrorMessage(error.message || '送信に失敗しました');
        return;
      }

      setStep('completed');
    } catch (err) {
      console.error('handleEmailSubmit error:', err);
      setErrorMessage('ネットワークエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedProfileId(null);
    setKarteResult(null);
    setFormData({
      contact_name: '',
      email: '',
      phone: '',
      salon_name: '',
      salon_size: '',
    });
    setErrorMessage(null);
    setStep('profile_select');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(44, 40, 37, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        style={{
          maxWidth: 720,
          width: '90vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
          padding: 32,
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 24,
            color: 'var(--c-fg-4)',
            padding: 0,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ×
        </button>

        {/* Error message */}
        {errorMessage && (
          <div
            style={{
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: 8,
              padding: '12px 16px',
              color: '#c44',
              fontSize: 14,
              marginBottom: 24,
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* Step content */}
        <div style={{ minHeight: 300 }}>
          {step === 'profile_select' && (
            <ProfileSelectStep
              onSelect={handleProfileSelect}
            />
          )}

          {step === 'counseling_display' && (
            <CounselingDisplayStep
              profileId={selectedProfileId!}
              onNext={handleCounselingComplete}
            />
          )}

          {step === 'ai_loading' && (
            <AILoadingStep />
          )}

          {step === 'karte_display' && (
            <KarteDisplayStep
              karte={karteResult}
              onNext={handleKarteNext}
            />
          )}

          {step === 'before_after' && (
            <BeforeAfterStep
              onNext={handleBeforeAfterNext}
            />
          )}

          {step === 'email_form' && (
            <EmailFormStep
              onSubmit={handleEmailSubmit}
              isSubmitting={isSubmitting}
            />
          )}

          {step === 'completed' && (
            <CompletedStep
              onClose={handleClose}
              onReset={handleReset}
            />
          )}
        </div>

        {/* Debug footer (development only) */}
        {process.env.NODE_ENV !== 'production' && (
          <div
            style={{
              marginTop: 32,
              paddingTop: 16,
              borderTop: '1px solid var(--c-border)',
              fontSize: 12,
              color: 'var(--c-fg-4)',
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={handleReset}
              style={{
                padding: '6px 12px',
                background: 'var(--c-bg-2)',
                border: '1px solid var(--c-border)',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              リセット
            </button>
            <button
              onClick={handleClose}
              style={{
                padding: '6px 12px',
                background: 'var(--c-bg-2)',
                border: '1px solid var(--c-border)',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              閉じる
            </button>
            <span style={{ marginLeft: 'auto' }}>Step: {step}</span>
          </div>
        )}
      </div>
    </div>
  );
}
