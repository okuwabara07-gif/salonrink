'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  volume: string;
  image_url: string | null;
  ec_url: string | null;
  target_hair_types: string[];
  matchCount?: number;
};

/**
 * 診断結果から最適な商品をおすすめ抽出
 * - concerns に含まれるタグでフィルタ
 * - 重なり数が多い順に並べる
 * - 0件時は全商品から人気順フォールバック
 */
export async function fetchRecommendedProducts(
  concerns: string[]
): Promise<Product[]> {
  const supabase = createAdminClient();

  // Step 1: 有効かつ非専売品の全商品を取得
  const { data: allProducts, error: fetchError } = await supabase
    .from('products')
    .select('id, name, brand, price, volume, image_url, ec_url, target_hair_types, is_active, agency_locked')
    .eq('is_active', true)
    .eq('agency_locked', false);

  if (fetchError) {
    console.error('[scan/actions] fetchRecommendedProducts error:', fetchError);
    return [];
  }

  if (!allProducts || allProducts.length === 0) {
    return [];
  }

  const products: Product[] = (allProducts as any[]).map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    price: p.price,
    volume: p.volume,
    image_url: p.image_url,
    ec_url: p.ec_url,
    target_hair_types: Array.isArray(p.target_hair_types) ? p.target_hair_types : [],
  }));

  // Step 2: concerns との重なりをカウント
  const matched: Product[] = products
    .map((p) => ({
      ...p,
      matchCount: p.target_hair_types.filter((t) =>
        concerns.includes(t)
      ).length,
    }))
    .filter((p) => p.matchCount > 0)
    .sort((a, b) => (b.matchCount || 0) - (a.matchCount || 0));

  // Step 3: 0件時はフォールバック（全商品を返す・ただし matchCount を 0 に設定）
  if (matched.length === 0) {
    return products.map((p) => ({ ...p, matchCount: 0 }));
  }

  return matched;
}

/**
 * 診断結果を保存（end_users upsert / diagnosis_results insert / customer_plan.karte_count++）
 * service role で実行（anon直書き禁止）
 */
export async function saveDiagnosisResult(
  lineUserId: string,
  displayName: string,
  diagnosisData: {
    primaryConcern: string;
    concerns: string[];
    summary: string;
    recommendation: string;
    homecare: string;
  },
  consent: {
    consentStats: boolean;
    consentPhoto: boolean;
    consentPr: boolean;
  }
): Promise<{ success: boolean; diagnosisId?: string; error?: string }> {
  const supabase = createAdminClient();

  try {
    // Step 1: end_users upsert（line_user_id が主キー）
    const { error: upsertUserError } = await supabase
      .from('end_users')
      .upsert(
        {
          line_user_id: lineUserId,
          display_name: displayName,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'line_user_id' }
      );

    if (upsertUserError) {
      console.error('[scan/actions] end_users upsert error:', upsertUserError);
      return { success: false, error: upsertUserError.message };
    }

    // Step 2: diagnosis_results insert（consent を含める）
    const { data: diagnosisResult, error: insertDiagError } = await supabase
      .from('diagnosis_results')
      .insert({
        line_user_id: lineUserId,
        diagnosis_type: diagnosisData.primaryConcern,
        result: {
          primaryConcern: diagnosisData.primaryConcern,
          concerns: diagnosisData.concerns,
          summary: diagnosisData.summary,
          recommendation: diagnosisData.recommendation,
          homecare: diagnosisData.homecare,
        },
        consent_stats: consent.consentStats,
        consent_photo: consent.consentPhoto,
        consent_pr: consent.consentPr,
        saved_at: null, // 「カルテに保存」時に更新
      })
      .select('id')
      .single();

    if (insertDiagError) {
      console.error('[scan/actions] diagnosis_results insert error:', insertDiagError);
      return { success: false, error: insertDiagError.message };
    }

    if (!diagnosisResult) {
      return { success: false, error: 'diagnosis_results insert returned no ID' };
    }

    return { success: true, diagnosisId: diagnosisResult.id };
  } catch (err) {
    console.error('[scan/actions] saveDiagnosisResult error:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * 「カルテに保存」ボタン押下時：diagnosis_results.saved_at 更新 + customer_plan.karte_count++
 */
export async function saveToKarte(
  lineUserId: string,
  diagnosisId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  try {
    // Step 1: diagnosis_results.saved_at を更新
    const { error: updateDiagError } = await supabase
      .from('diagnosis_results')
      .update({ saved_at: new Date().toISOString() })
      .eq('id', diagnosisId);

    if (updateDiagError) {
      console.error('[scan/actions] diagnosis_results update error:', updateDiagError);
      return { success: false, error: updateDiagError.message };
    }

    // Step 2: customer_plan.karte_count++ （plan は上書きしない）
    const { data: plan, error: selectError } = await supabase
      .from('customer_plan')
      .select('karte_count')
      .eq('line_user_id', lineUserId)
      .maybeSingle();

    if (selectError) {
      console.error('[scan/actions] customer_plan select error:', selectError);
      return { success: false, error: selectError.message };
    }

    const currentCount = plan?.karte_count || 0;

    // 既存行 → karte_count のみ UPDATE
    if (plan) {
      const { error: updateError } = await supabase
        .from('customer_plan')
        .update({ karte_count: currentCount + 1 })
        .eq('line_user_id', lineUserId);

      if (updateError) {
        console.error('[scan/actions] customer_plan update error:', updateError);
        return { success: false, error: updateError.message };
      }
    } else {
      // 新規行 → INSERT（plan は DB default に任せる）
      const { error: insertError } = await supabase
        .from('customer_plan')
        .insert({
          line_user_id: lineUserId,
          karte_count: currentCount + 1,
        });

      if (insertError) {
        console.error('[scan/actions] customer_plan insert error:', insertError);
        return { success: false, error: insertError.message };
      }
    }

    return { success: true };
  } catch (err) {
    console.error('[scan/actions] saveToKarte error:', err);
    return { success: false, error: String(err) };
  }
}
