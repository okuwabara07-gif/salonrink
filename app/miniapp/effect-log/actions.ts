'use server';

import { createAdminClient } from '@/lib/supabase/admin';

/**
 * 効果記録を保存
 * - product_effects insert（line_user_id必須、diagnosis_id任意）
 * - mycarte-photos へ写真アップロード（before/after）
 * - customer_plan.photo_bytes 加算（容量チェック・1GB上限）
 */
export async function saveEffectLog(
  lineUserId: string,
  productId: string,
  concern: string,
  effectRating: number, // 1-5
  effectNote: string,
  beforePhotoFile: File | null,
  afterPhotoFile: File | null,
  consentPr: boolean,
  diagnosisId?: string, // 任意：診断経由の場合のみ
  usedFrom?: string // 任意：YYYY-MM-DD 形式
): Promise<{ success: boolean; effectId?: string; error?: string }> {
  const supabase = createAdminClient();

  try {
    // Step 1: 容量チェック（保存前）
    const { data: plan, error: selectError } = await supabase
      .from('customer_plan')
      .select('photo_bytes')
      .eq('line_user_id', lineUserId)
      .maybeSingle();

    if (selectError) {
      console.error('[effect-log/actions] customer_plan select error:', selectError);
      return { success: false, error: selectError.message };
    }

    const currentBytes = plan?.photo_bytes || 0;
    const newFileSize = (beforePhotoFile?.size || 0) + (afterPhotoFile?.size || 0);
    const totalBytes = currentBytes + newFileSize;
    const MAX_BYTES = 1024 * 1024 * 1024; // 1GB

    if (totalBytes > MAX_BYTES) {
      console.warn(`[effect-log/actions] quota exceeded: ${totalBytes} > ${MAX_BYTES}`);
      return {
        success: false,
        error: 'ストレージ容量超過。Premiumへアップグレードしてください。',
      };
    }

    // Step 2: 写真アップロード（mycarte-photos へ storage_path のみ保存）
    // 注: after失敗時に before が残る場合あり。孤児ファイルはバッチ清掃で対応。
    let beforePhotoPath: string | null = null;
    let afterPhotoPath: string | null = null;

    if (beforePhotoFile) {
      const timestamp = Date.now();
      // ファイル実型に基づき拡張子を決定
      const ext = getFileExtension(beforePhotoFile.type);
      const beforePath = `effect-logs/${lineUserId}/${productId}_${timestamp}_before${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('mycarte-photos')
        .upload(beforePath, beforePhotoFile, {
          upsert: false,
          contentType: beforePhotoFile.type,
        });

      if (uploadError) {
        console.error('[effect-log/actions] before_photo upload error:', uploadError);
        return { success: false, error: `Before写真アップロード失敗: ${uploadError.message}` };
      }
      beforePhotoPath = beforePath;
    }

    if (afterPhotoFile) {
      const timestamp = Date.now();
      const ext = getFileExtension(afterPhotoFile.type);
      const afterPath = `effect-logs/${lineUserId}/${productId}_${timestamp}_after${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('mycarte-photos')
        .upload(afterPath, afterPhotoFile, {
          upsert: false,
          contentType: afterPhotoFile.type,
        });

      if (uploadError) {
        console.error('[effect-log/actions] after_photo upload error:', uploadError);
        return { success: false, error: `After写真アップロード失敗: ${uploadError.message}` };
      }
      afterPhotoPath = afterPath;
    }

    // Step 3: product_effects insert
    const { data: effectResult, error: insertError } = await supabase
      .from('product_effects')
      .insert({
        line_user_id: lineUserId,
        diagnosis_id: diagnosisId || null, // 任意
        product_id: productId,
        concern,
        used_from: usedFrom || null, // 任意：YYYY-MM-DD
        effect_rating: effectRating, // smallint 1-5
        effect_note: effectNote,
        before_photo: beforePhotoPath,
        after_photo: afterPhotoPath,
        consent_pr: consentPr, // 既定false
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[effect-log/actions] product_effects insert error:', insertError);
      return { success: false, error: insertError.message };
    }

    if (!effectResult) {
      return { success: false, error: 'product_effects insert returned no ID' };
    }

    // Step 4: customer_plan.photo_bytes 加算（plan は上書きしない）
    // 既存行が有れば photo_bytes のみ UPDATE、無ければ INSERT
    // plan='premium' ユーザーを free に巻き戻す事故を防止
    const { data: existingPlan, error: checkError } = await supabase
      .from('customer_plan')
      .select('id')
      .eq('line_user_id', lineUserId)
      .maybeSingle();

    if (checkError) {
      console.error('[effect-log/actions] customer_plan check error:', checkError);
      return { success: false, error: checkError.message };
    }

    if (existingPlan) {
      // 既存行 → photo_bytes のみ UPDATE
      const { error: updateError } = await supabase
        .from('customer_plan')
        .update({ photo_bytes: totalBytes })
        .eq('line_user_id', lineUserId);

      if (updateError) {
        console.error('[effect-log/actions] customer_plan update error:', updateError);
        return { success: false, error: updateError.message };
      }
    } else {
      // 新規行 → INSERT（plan は DB default に任せる）
      const { error: insertError } = await supabase
        .from('customer_plan')
        .insert({
          line_user_id: lineUserId,
          photo_bytes: totalBytes,
        });

      if (insertError) {
        console.error('[effect-log/actions] customer_plan insert error:', insertError);
        return { success: false, error: insertError.message };
      }
    }

    return { success: true, effectId: effectResult.id };
  } catch (err) {
    console.error('[effect-log/actions] saveEffectLog error:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * ファイル MIME type から拡張子を取得
 */
function getFileExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
  };
  return map[mimeType] || '.jpg'; // デフォルト .jpg
}

/**
 * product_effects を line_user_id で取得（カルテ表示用）
 */
export async function fetchEffectLogs(
  lineUserId: string
): Promise<
  Array<{
    id: string;
    productId: string;
    concern: string;
    effectRating: number;
    effectNote: string;
    beforePhoto: string | null;
    afterPhoto: string | null;
    consentPr: boolean;
    createdAt: string;
  }>
> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('product_effects')
    .select('id, product_id, concern, effect_rating, effect_note, before_photo, after_photo, consent_pr, created_at')
    .eq('line_user_id', lineUserId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[effect-log/actions] fetchEffectLogs error:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    productId: row.product_id,
    concern: row.concern,
    effectRating: row.effect_rating,
    effectNote: row.effect_note,
    beforePhoto: row.before_photo,
    afterPhoto: row.after_photo,
    consentPr: row.consent_pr,
    createdAt: row.created_at,
  }));
}
