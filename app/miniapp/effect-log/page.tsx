'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import liff from '@line/liff';
import { saveEffectLog } from './actions';

type EffectLogState = 'loading' | 'form' | 'saving' | 'success' | 'error';

const C = {
  gold: '#E9D7A6',
  olive: '#5E6A47',
  ink: '#2b2622',
  muted: '#6f655d',
  bg: '#FAF9F5',
  line: '#ece6df',
};

function EffectLogPageContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<EffectLogState>('loading');
  const [lineUserId, setLineUserId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // URL パラメータから初期値取得
  const diagId = searchParams.get('diagId');
  const productId = searchParams.get('productId');
  const productName = searchParams.get('productName');
  const initialConcern = searchParams.get('concern') || '';

  // フォーム入力
  const [concern, setConcern] = useState<string>(initialConcern);
  const [effectRating, setEffectRating] = useState<number>(3);
  const [effectNote, setEffectNote] = useState<string>('');
  const [usedFrom, setUsedFrom] = useState<string>('');
  const [beforePhoto, setBeforePhoto] = useState<File | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<File | null>(null);
  const [consentPr, setConsentPr] = useState<boolean>(false);

  // LIFF 初期化
  useEffect(() => {
    const init = async () => {
      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID_CUSTOMER;
        if (!liffId) throw new Error('LIFF ID が設定されていません');

        await liff.init({ liffId });
        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        const profile = await liff.getProfile();
        setLineUserId(profile.userId);
        setState('form');
      } catch (err) {
        console.error('[effect-log] LIFF init error:', err);
        setErrorMsg('ログインに失敗しました');
        setState('error');
      }
    };

    init();
  }, []);

  // 保存実行
  const handleSave = async () => {
    if (!productId) {
      setErrorMsg('商品 ID が見つかりません');
      return;
    }

    if (!concern) {
      setErrorMsg('悩みを選択してください');
      return;
    }

    setState('saving');
    setErrorMsg('');

    try {
      const result = await saveEffectLog(
        lineUserId,
        productId,
        concern,
        effectRating,
        effectNote,
        beforePhoto,
        afterPhoto,
        consentPr,
        diagId || undefined,
        usedFrom || undefined
      );

      if (!result.success) {
        throw new Error(result.error || '保存に失敗しました');
      }

      setState('success');
      // 3秒後にカルテへ遷移
      setTimeout(() => {
        window.location.href = '/miniapp/mypage';
      }, 3000);
    } catch (err) {
      console.error('[effect-log] save error:', err);
      setErrorMsg(String(err));
      setState('error');
    }
  };

  // UI：フォーム
  if (state === 'form') {
    return (
      <div style={{ padding: '16px', fontFamily: 'sans-serif', backgroundColor: C.bg, minHeight: '100vh' }}>
        <h1 style={{ color: C.ink, marginBottom: '24px' }}>効果を記録</h1>

        {productName && (
          <div style={{ backgroundColor: '#fff', padding: '12px', marginBottom: '20px', borderRadius: '4px' }}>
            <p style={{ fontSize: '14px', color: C.muted, margin: '0 0 4px 0' }}>対象商品</p>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: C.ink, margin: 0 }}>
              {productName}
            </p>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: C.ink, fontWeight: 'bold' }}>
            変化を感じた悩み（必須）
          </label>
          <select
            value={concern}
            onChange={(e) => setConcern(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${C.line}`,
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            <option value="">選択してください</option>
            {['ダメージ', '乾燥', '広がり', '白髪', 'うねり', '褪色'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: C.ink, fontWeight: 'bold' }}>
            使用・購入開始日（任意）
          </label>
          <input
            type="date"
            value={usedFrom}
            onChange={(e) => setUsedFrom(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${C.line}`,
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: C.ink, fontWeight: 'bold' }}>
            実感度（1-5）
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                onClick={() => setEffectRating(r)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: effectRating === r ? C.olive : '#f0f0f0',
                  color: effectRating === r ? '#fff' : C.ink,
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: C.ink, fontWeight: 'bold' }}>
            感想・メモ（任意）
          </label>
          <textarea
            value={effectNote}
            onChange={(e) => setEffectNote(e.target.value)}
            placeholder="使い心地や効果について"
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${C.line}`,
              borderRadius: '4px',
              minHeight: '80px',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: C.ink, fontWeight: 'bold' }}>
            写真（任意：Before/After）
          </label>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: C.muted }}>
              Before
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setBeforePhoto(e.target.files?.[0] || null)}
              style={{ display: 'block', width: '100%', marginBottom: '12px' }}
            />
            {beforePhoto && (
              <p style={{ fontSize: '12px', color: C.muted, margin: 0 }}>
                {beforePhoto.name} ({(beforePhoto.size / 1024).toFixed(0)} KB)
              </p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: C.muted }}>
              After
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setAfterPhoto(e.target.files?.[0] || null)}
              style={{ display: 'block', width: '100%' }}
            />
            {afterPhoto && (
              <p style={{ fontSize: '12px', color: C.muted, margin: 0 }}>
                {afterPhoto.name} ({(afterPhoto.size / 1024).toFixed(0)} KB)
              </p>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#fff', border: `1px solid ${C.line}`, borderRadius: '4px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={consentPr}
              onChange={(e) => setConsentPr(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            <span style={{ fontSize: '12px' }}>
              この記録をPR・SNSで紹介してよい（匿名・部分加工が既定。個人が特定される形は追加同意のうえ）
            </span>
          </label>
        </div>

        <button
          onClick={handleSave}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: C.olive,
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: '12px',
          }}
        >
          保存
        </button>

        {errorMsg && (
          <div style={{ padding: '8px', backgroundColor: '#ffcccc', color: '#cc0000', borderRadius: '4px', fontSize: '12px' }}>
            {errorMsg}
          </div>
        )}
      </div>
    );
  }

  // UI：保存中
  if (state === 'saving') {
    return (
      <div style={{ padding: '16px', textAlign: 'center', backgroundColor: C.bg, minHeight: '100vh' }}>
        <p style={{ color: C.muted }}>保存中...</p>
      </div>
    );
  }

  // UI：完了
  if (state === 'success') {
    return (
      <div style={{ padding: '16px', backgroundColor: C.bg, minHeight: '100vh', textAlign: 'center' }}>
        <h1 style={{ color: C.olive, marginBottom: '16px' }}>保存しました</h1>
        <p style={{ color: C.muted, marginBottom: '16px' }}>
          3秒後にカルテに戻ります...
        </p>
      </div>
    );
  }

  // UI：エラー
  if (state === 'error') {
    return (
      <div style={{ padding: '16px', backgroundColor: C.bg, minHeight: '100vh' }}>
        <h1 style={{ color: C.olive }}>エラー</h1>
        <p style={{ color: C.muted }}>{errorMsg}</p>
        <button
          onClick={() => {
            window.location.reload();
          }}
          style={{
            padding: '12px 24px',
            backgroundColor: C.olive,
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          リトライ
        </button>
      </div>
    );
  }

  return null;
}

export default function EffectLogPage() {
  return (
    <Suspense fallback={<div style={{ padding: '16px', backgroundColor: '#FAF9F5', minHeight: '100vh' }}>読み込み中...</div>}>
      <EffectLogPageContent />
    </Suspense>
  );
}
