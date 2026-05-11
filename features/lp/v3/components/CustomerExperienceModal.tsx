'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import CustomerProfileSelectStep from './CustomerExperienceSteps/CustomerProfileSelectStep';
import BeforeSalonExperienceStep from './CustomerExperienceSteps/BeforeSalonExperienceStep';
import PreCounselingExperienceStep from './CustomerExperienceSteps/PreCounselingExperienceStep';
import SalonReceivedDataStep from './CustomerExperienceSteps/SalonReceivedDataStep';
import SalonDayExperienceStep from './CustomerExperienceSteps/SalonDayExperienceStep';
import RememberedExperienceStep from './CustomerExperienceSteps/RememberedExperienceStep';
import CustomerCompletedStep from './CustomerExperienceSteps/CustomerCompletedStep';

type Step = 'profile_select' | 'before_salon' | 'pre_counseling' | 'salon_received' | 'day_experience' | 'remembered' | 'completed';

interface CustomerExperienceModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  contact_name: string;
  email: string;
  salon_name?: string;
  message?: string;
}

export default function CustomerExperienceModal({ open, onClose }: CustomerExperienceModalProps) {
  const [step, setStep] = useState<Step>('profile_select');
  const [selectedProfileId, setSelectedProfileId] = useState<1 | 2 | 3 | null>(null);
  const [formData, setFormData] = useState<FormData>({
    contact_name: '',
    email: '',
    salon_name: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!open) return null;

  const handleNext = (nextStep: Step) => {
    setStep(nextStep);
  };

  const handleSelectProfile = (profileId: 1 | 2 | 3) => {
    setSelectedProfileId(profileId);
    handleNext('before_salon');
  };

  const handleFinalSubmit = async (data: Partial<FormData>) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        contact_name: data.contact_name || '',
        email: data.email || '',
        salon_name: data.salon_name || undefined,
        cta_type: 'ai_experience',
        source: 'customer_experience',
        ai_experience_result: {
          type: 'customer',
          profile_id: selectedProfileId,
          message: data.message || undefined,
        },
      };

      const res = await fetch('/api/lead-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setErrorMessage(errorData.message || 'Error submitting form');
        return;
      }

      handleNext('completed');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep('profile_select');
    setSelectedProfileId(null);
    setFormData({ contact_name: '', email: '', salon_name: '', message: '' });
    setErrorMessage('');
  };

  const renderStepContent = (): ReactNode => {
    switch (step) {
      case 'profile_select':
        return (
          <CustomerProfileSelectStep
            onSelect={handleSelectProfile}
          />
        );
      case 'before_salon':
        return (
          <BeforeSalonExperienceStep
            profileId={selectedProfileId || 1}
            onNext={() => handleNext('pre_counseling')}
          />
        );
      case 'pre_counseling':
        return (
          <PreCounselingExperienceStep
            profileId={selectedProfileId || 1}
            onNext={() => handleNext('salon_received')}
          />
        );
      case 'salon_received':
        return (
          <SalonReceivedDataStep
            profileId={selectedProfileId || 1}
            onNext={() => handleNext('day_experience')}
          />
        );
      case 'day_experience':
        return (
          <SalonDayExperienceStep
            profileId={selectedProfileId || 1}
            onNext={() => handleNext('remembered')}
          />
        );
      case 'remembered':
        return (
          <RememberedExperienceStep
            profileId={selectedProfileId || 1}
            onNext={() => handleNext('completed')}
          />
        );
      case 'completed':
        return (
          <CustomerCompletedStep
            onSubmit={handleFinalSubmit}
            onClose={onClose}
            onReset={handleReset}
            isSubmitting={isSubmitting}
            formData={formData}
            setFormData={setFormData}
            errorMessage={errorMessage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(44, 40, 37, 0.6)',
          zIndex: 1000,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
          padding: 20,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 760,
            backgroundColor: 'white',
            borderRadius: 16,
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.3)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 10,
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: '#999',
            }}
          >
            ×
          </button>

          {/* Content */}
          <div style={{ padding: '40px 32px 32px' }}>
            {renderStepContent()}
          </div>

          {/* Debug footer */}
          {process.env.NODE_ENV !== 'production' && (
            <div style={{
              borderTop: '1px solid #eee',
              padding: '8px 16px',
              fontSize: '11px',
              color: '#999',
              backgroundColor: '#f9f9f9',
            }}>
              DEBUG: step={step}, profile={selectedProfileId}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

