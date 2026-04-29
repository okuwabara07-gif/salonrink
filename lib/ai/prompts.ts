// AIカルテ用プロンプトテンプレート集
// Phase 1: AIカルテ API スケルトン
// kartes テーブルスキーマに基づいた実装

// Karte 型定義（実テーブルスキーマに基づく）
// kartes テーブル: 基本カラムのみ
// 詳細情報（髪質・施術内容等）は karte_recipes にて jsonb 格納
export interface Karte {
  id: string;
  salon_id: string;
  customer_id: string | null;
  visit_date: string; // DATE
  created_at: string;
  updated_at: string;
  // AI 出力用カラム（ai_summary 等は UPDATE 時に使用）
  ai_summary?: Record<string, any>;
  ai_communication_scripts?: Record<string, any>;
  ai_warnings?: Record<string, any>;
  ai_next_recommendation?: Record<string, any>;
}

// karte_recipes から詳細情報を取得する関数
export interface KarteRecipe {
  recipe_type: string; // 'hair_color', 'treatment', など
  recipe_data: Record<string, any>; // 髪質・メニュー・薬剤情報等
  notes?: string;
}

// 顧客サマリー生成用プロンプト
// API 呼び出し時に karte + recipe データ を結合して渡す
export function getCustomerSummaryPrompt(
  karte: Karte,
  customerName: string,
  recipeData?: Record<string, any>
): string {
  const hairInfo = recipeData?.hair_condition || '不明';
  const menuInfo = recipeData?.menu_name || '不明';
  const treatmentNote = recipeData?.treatment_note || 'なし';

  return `以下は美容室の顧客情報です。顧客の現在の状態を構造化したサマリーを生成してください。

【顧客情報】
名前: ${customerName}
最終来店日: ${karte.visit_date || 'なし'}
髪の状態: ${hairInfo}
前回メニュー: ${menuInfo}
施術メモ: ${treatmentNote}

【出力形式】
JSON形式で以下の構造で返してください:
{
  "summary": "顧客の現在状態の1-2文での要約",
  "hair_condition_analysis": "髪の状態に関する評価",
  "recommended_care": "推奨されるケア方法",
  "generated_at": "現在時刻(ISO 8601形式)",
  "model": "claude-haiku-4-5"
}

簡潔かつ実用的な内容を心がけてください。`;
}

// 接客スクリプト生成用プロンプト
export function getCommunicationScriptPrompt(
  karte: Karte,
  customerName: string,
  plannedMenu: string,
  recipeData?: Record<string, any>
): string {
  const hairInfo = recipeData?.hair_condition || '不明';
  const treatmentNote = recipeData?.treatment_note || 'なし';

  return `以下の顧客情報と計画メニューに基づいて、接客スクリプトを生成してください。

【顧客情報】
名前: ${customerName}
最終来店日: ${karte.visit_date || 'なし'}
髪の状態: ${hairInfo}
施術メモ: ${treatmentNote}

【計画メニュー】
${plannedMenu}

【出力形式】
JSON形式で以下の構造で返してください:
{
  "pre_service": "施術前のカウンセリングで言うべき内容(顧客の髪状態への理解を示す)",
  "confirmation_checklist": ["確認項目1", "確認項目2", "確認項目3"],
  "homecare_advice": "施術後のホームケアアドバイス",
  "risk_alerts": ["注意が必要な点1", "注意が必要な点2"]
}

顧客に安心感を与え、施術の価値を伝える内容にしてください。`;
}

// アレルギー警告生成用プロンプト
export function getAllergyWarningPrompt(
  karte: Karte,
  customerName: string,
  recipeData?: Record<string, any>
): string {
  const hairInfo = recipeData?.hair_condition || '不明';
  const allergies = recipeData?.allergies || 'なし';
  const treatmentNote = recipeData?.treatment_note || 'なし';

  return `以下の顧客情報から、施術前の注意事項と警告を生成してください。

【顧客情報】
名前: ${customerName}
髪の状態: ${hairInfo}
アレルギー: ${allergies}
施術メモ: ${treatmentNote}

【出力形式】
JSON形式で以下の構造で返してください:
{
  "allergy_warnings": ["警告1", "警告2"],
  "damage_alerts": ["ダメージに関する警告1", "ダメージに関する警告2"],
  "scalp_concerns": ["頭皮に関する懸念"],
  "risk_level": "low" | "medium" | "high",
  "recommended_action": "推奨される対応"
}

顧客の安全を最優先に、具体的で実行可能な内容にしてください。`;
}

// 次回提案生成用プロンプト
export function getNextRecommendationPrompt(
  karte: Karte,
  customerName: string,
  currentMenu: string,
  recipeData?: Record<string, any>
): string {
  const hairInfo = recipeData?.hair_condition || '不明';
  const prevMenu = recipeData?.menu_name || '不明';

  return `以下の顧客情報と今回の施術内容から、次回来店時の提案を生成してください。

【顧客情報】
名前: ${customerName}
最終来店日: ${karte.visit_date || 'なし'}
髪の状態: ${hairInfo}
前回メニュー: ${prevMenu}

【今回の施術内容】
${currentMenu}

【出力形式】
JSON形式で以下の構造で返してください:
{
  "next_visit_date": "推奨される次回来店日(YYYY-MM-DD形式)",
  "recommended_menu": "推奨メニュー名",
  "reasoning": "推奨理由(顧客の髪の状態とダメージ管理の観点から)",
  "homecare_duration": "施術効果を保つために推奨されるホームケア期間(日数)",
  "additional_notes": "その他の提案事項"
}

顧客の来店パターンと髪の健康を考慮した提案にしてください。`;
}
