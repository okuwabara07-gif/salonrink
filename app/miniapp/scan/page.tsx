'use client';

import { useEffect, useState } from 'react';
import liff from '@line/liff';
import { fetchRecommendedProducts, saveDiagnosisResult, saveToKarte, type Product } from './actions';

type DiagnosisState = 'loading' | 'collecting' | 'diagnosing' | 'result' | 'error';

type DiagnosisResult = {
  primaryConcern: string;
  concerns: string[];
  summary: string;
  recommendation: string;
  homecare: string;
};

const C = {
  gold: '#E9D7A6',
  olive: '#5E6A47',
  ink: '#2b2622',
  muted: '#6f655d',
  bg: '#FAF9F5',
  line: '#ece6df',
};

export default function ScanPage() {
  const [state, setState] = useState<DiagnosisState>('loading');
  const [lineUserId, setLineUserId] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // 入力フェーズ
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [hairType, setHairType] = useState<string>('');
  const [desired, setDesired] = useState<string>('');

  // 同意ゲート
  const [consentStats, setConsentStats] = useState(false);
  const [consentPhoto, setConsentPhoto] = useState(false);
  const [consentPr, setConsentPr] = useState(false);

  // 診断結果
  const [diagResult, setDiagResult] = useState<DiagnosisResult | null>(null);
  const [diagId, setDiagId] = useState<string>('');
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [isSavingToKarte, setIsSavingToKarte] = useState(false);

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
        setDisplayName(profile.displayName || '顧客');
        setState('collecting');
      } catch (err) {
        console.error('[scan] LIFF init error:', err);
        setErrorMsg('ログインに失敗しました');
        setState('error');
      }
    };

    init();
  }, []);

  // 診断実行
  const handleDiagnose = async () => {
    if (selectedConcerns.length === 0) {
      setErrorMsg('少なくとも1つの悩みを選択してください');
      return;
    }

    setState('diagnosing');
    setErrorMsg('');

    try {
      // API に診断リクエスト
      const diagRes = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concerns: selectedConcerns,
          hairType,
          desired,
        }),
      });

      if (!diagRes.ok) {
        const err = await diagRes.json();
        throw new Error(err.error || '診断に失敗しました');
      }

      const result = await diagRes.json() as DiagnosisResult;
      setDiagResult(result);

      // 診断結果を保存（end_users upsert / diagnosis_results insert / consent含む）
      const saveRes = await saveDiagnosisResult(lineUserId, displayName, result, {
        consentStats,
        consentPhoto,
        consentPr,
      });
      if (!saveRes.success) {
        throw new Error(saveRes.error || '保存に失敗しました');
      }

      setDiagId(saveRes.diagnosisId || '');

      // おすすめ商品を抽出
      const recs = await fetchRecommendedProducts(result.concerns);
      setRecommended(recs);

      setState('result');
    } catch (err) {
      console.error('[scan] diagnose error:', err);
      setErrorMsg(String(err));
      setState('error');
    }
  };

  // 「カルテに保存」
  const handleSaveToKarte = async () => {
    if (!diagId) {
      setErrorMsg('診断 ID が見つかりません');
      return;
    }

    setIsSavingToKarte(true);
    try {
      const res = await saveToKarte(lineUserId, diagId);
      if (!res.success) {
        throw new Error(res.error || 'カルテ保存に失敗しました');
      }

      // 成功時は次ページへ遷移（例：/miniapp/mypage）
      if (typeof window !== 'undefined') {
        window.location.href = '/miniapp/mypage';
      }
    } catch (err) {
      console.error('[scan] saveToKarte error:', err);
      setErrorMsg(String(err));
    } finally {
      setIsSavingToKarte(false);
    }
  };

  // UI：入力フェーズ
  if (state === 'collecting') {
    return (
      <div style={{ padding: '16px', fontFamily: 'sans-serif', backgroundColor: C.bg, minHeight: '100vh' }}>
        <h1 style={{ color: C.ink, marginBottom: '24px' }}>ヘアケア診断</h1>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: C.ink, fontWeight: 'bold' }}>
            髪の悩み（複数選択可）
          </label>
          {['ダメージ', '乾燥', '広がり', '白髪', 'うねり', '褪色'].map((concern) => (
            <label key={concern} style={{ display: 'block', marginBottom: '8px' }}>
              <input
                type="checkbox"
                checked={selectedConcerns.includes(concern)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedConcerns([...selectedConcerns, concern]);
                  } else {
                    setSelectedConcerns(selectedConcerns.filter((c) => c !== concern));
                  }
                }}
                style={{ marginRight: '8px' }}
              />
              {concern}
            </label>
          ))}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: C.ink, fontWeight: 'bold' }}>
            髪質
          </label>
          <input
            type="text"
            value={hairType}
            onChange={(e) => setHairType(e.target.value)}
            placeholder="例：細い、太い、くせ毛"
            style={{ width: '100%', padding: '8px', border: `1px solid ${C.line}` }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: C.ink, fontWeight: 'bold' }}>
            なりたい印象
          </label>
          <input
            type="text"
            value={desired}
            onChange={(e) => setDesired(e.target.value)}
            placeholder="例：艶やか、まとまりやすく"
            style={{ width: '100%', padding: '8px', border: `1px solid ${C.line}` }}
          />
        </div>

        <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#fff', border: `1px solid ${C.line}`, borderRadius: '4px' }}>
          <h3 style={{ color: C.ink, marginBottom: '12px', fontSize: '14px' }}>同意設定（いつでも変更できます）</h3>
          <label style={{ display: 'block', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={consentStats}
              onChange={(e) => setConsentStats(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            <span style={{ fontSize: '12px' }}>匿名の統計データとして活用してよい</span>
          </label>
          <label style={{ display: 'block', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={consentPhoto}
              onChange={(e) => setConsentPhoto(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            <span style={{ fontSize: '12px' }}>髪の写真を保存してよい</span>
          </label>
          <label style={{ display: 'block' }}>
            <input
              type="checkbox"
              checked={consentPr}
              onChange={(e) => setConsentPr(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            <span style={{ fontSize: '12px' }}>この記録をPR・SNSで紹介してよい（匿名・部分加工が既定。個人が特定される形は追加同意のうえ）</span>
          </label>
        </div>

        <button
          onClick={handleDiagnose}
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
          }}
        >
          診断する
        </button>

        {errorMsg && (
          <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#ffcccc', color: '#cc0000', borderRadius: '4px' }}>
            {errorMsg}
          </div>
        )}
      </div>
    );
  }

  // UI：診断中
  if (state === 'diagnosing') {
    return (
      <div style={{ padding: '16px', textAlign: 'center', backgroundColor: C.bg, minHeight: '100vh' }}>
        <p style={{ color: C.muted }}>診断中...</p>
      </div>
    );
  }

  // UI：結果表示
  if (state === 'result' && diagResult) {
    return (
      <div style={{ padding: '16px', fontFamily: 'sans-serif', backgroundColor: C.bg, minHeight: '100vh' }}>
        <h1 style={{ color: C.ink, marginBottom: '20px' }}>診断結果</h1>

        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: `2px solid ${C.olive}` }}>
          <h2 style={{ color: C.olive, fontSize: '18px', marginBottom: '12px' }}>
            {diagResult.primaryConcern}
          </h2>

          <p style={{ color: C.ink, marginBottom: '12px', lineHeight: '1.6' }}>
            {diagResult.summary}
          </p>

          <div style={{ marginBottom: '12px' }}>
            <h3 style={{ color: C.gold, fontSize: '14px', marginBottom: '8px' }}>ケアの方向性</h3>
            <p style={{ color: C.muted, fontSize: '14px' }}>{diagResult.recommendation}</p>
          </div>

          <div>
            <h3 style={{ color: C.gold, fontSize: '14px', marginBottom: '8px' }}>自宅ケアのポイント</h3>
            <p style={{ color: C.muted, fontSize: '14px' }}>{diagResult.homecare}</p>
          </div>

          <p style={{ marginTop: '16px', fontSize: '12px', color: C.muted }}>
            ※本診断は医療行為ではなく、効果を保証するものではありません。<br />
            個人差があります。
          </p>
        </div>

        <h2 style={{ color: C.ink, marginBottom: '12px', fontSize: '16px' }}>おすすめの商品</h2>

        <p style={{ fontSize: '12px', color: C.muted, marginBottom: '12px' }}>
          ※サロン専売品は店頭でのご案内となります。<br />
          価格・在庫・お支払いは BASE で確認できます。
        </p>

        {recommended.length === 0 ? (
          <p style={{ color: C.muted }}>おすすめの商品がみつかりません</p>
        ) : (
          <div style={{ marginBottom: '20px' }}>
            {recommended.map((p) => (
              <div
                key={p.id}
                style={{
                  backgroundColor: '#fff',
                  padding: '12px',
                  marginBottom: '12px',
                  borderRadius: '4px',
                  border: `1px solid ${C.line}`,
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: C.ink, marginBottom: '4px' }}>
                  {p.name}
                </div>
                <div style={{ fontSize: '12px', color: C.muted, marginBottom: '8px' }}>
                  {p.brand} {p.volume && `${p.volume}`}
                </div>
                {p.matchCount !== undefined && p.matchCount > 0 && (
                  <div style={{ fontSize: '12px', color: C.gold, marginBottom: '4px' }}>
                    {`悩み ${p.matchCount} 件マッチ`}
                  </div>
                )}
                <div style={{ fontSize: '12px', color: C.muted, marginBottom: '8px' }}>
                  ¥{p.price?.toLocaleString()}
                </div>
                <a
                  href={`/miniapp/effect-log?productId=${p.id}&productName=${encodeURIComponent(p.name)}&concern=${encodeURIComponent(diagResult.primaryConcern)}&diagId=${diagId}`}
                  style={{
                    display: 'inline-block',
                    padding: '8px 12px',
                    backgroundColor: C.olive,
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  この商品の効果を記録
                </a>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleSaveToKarte}
          disabled={isSavingToKarte}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: isSavingToKarte ? C.muted : C.olive,
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isSavingToKarte ? 'not-allowed' : 'pointer',
            marginBottom: '12px',
          }}
        >
          {isSavingToKarte ? '保存中...' : 'カルテに保存'}
        </button>

        {errorMsg && (
          <div style={{ padding: '8px', backgroundColor: '#ffcccc', color: '#cc0000', borderRadius: '4px' }}>
            {errorMsg}
          </div>
        )}
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
