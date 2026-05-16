/**
 * SalonRink コンシェルジュ(AI経営アドバイザー)プロンプト関数群
 *
 * 責務:
 * - 当月の経営KPIから Claude Haiku 用プロンプトを生成
 * - AI 応答の JSON 検証
 * - AI 失敗時のフォールバック応答
 *
 * 特徴:
 * - 純粋関数のみ(副作用なし・AI呼び出しなし)
 * - 個人情報を含めない(KPIは集計値のみ。顧客名・予約明細は渡さない = A2準拠)
 */

// ========================================
// 型定義
// ========================================

export interface ConsKpis {
  monthCount: number;        // 今月の予約件数
  monthRevenue: number;      // 今月の売上見込(円)
  avgSpend: number;          // 平均客単価(円)
  newCustomers: number;      // 今月の新規顧客数
  repeatRate: number;        // リピート率(0-100)
  dormantCustomers: number;  // 休眠顧客数(60日以上)
  totalCustomers: number;    // 総顧客数
}

export interface ConsSuggestion {
  title: string;   // 打ち手のタイトル(40文字以内)
  body: string;    // 具体的な内容(160文字以内)
  category: string; // '空き枠埋め' | '客単価UP' | 'リピート改善' | '新規集客' など
}

export interface ConsAnalysis {
  narrative: string;            // 経営状況の総括(200文字以内)
  suggestions: ConsSuggestion[]; // 打ち手(最大3件)
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  cleaned?: ConsAnalysis;
}

// ========================================
// 1. プロンプト生成
// ========================================

/**
 * 当月KPIから経営アドバイス用プロンプトを生成
 * 個人情報は一切含めない(集計値のみ)
 */
export function buildConsPrompt(params: {
  kpis: ConsKpis;
  monthLabel: string; // 例: "2026年5月"
}): string {
  const { kpis, monthLabel } = params;

  return `あなたは美容サロンの経営アドバイザーです。以下は ${monthLabel} の当サロンの経営KPI(集計値)です。このデータのみに基づいて、現実的で具体的な経営アドバイスをしてください。データにない数値を創作してはいけません。

【当月の経営KPI】
- 予約件数: ${kpis.monthCount} 件
- 売上見込: ${kpis.monthRevenue.toLocaleString()} 円
- 平均客単価: ${Math.round(kpis.avgSpend).toLocaleString()} 円
- 新規顧客: ${kpis.newCustomers} 名
- リピート率: ${kpis.repeatRate.toFixed(1)} %
- 休眠顧客(60日以上未来店): ${kpis.dormantCustomers} 名
- 総顧客数: ${kpis.totalCustomers} 名

【出力形式】
JSON形式で以下の構造で返してください(マークダウンのコードブロックで囲んでください):
{
  "narrative": "当月の経営状況の総括。良い点と課題を200文字以内で。具体的な数値はKPIの値のみ使用。",
  "suggestions": [
    {
      "title": "打ち手のタイトル(40文字以内)",
      "body": "具体的にどう実行するか。SalonRinkのDM配信機能や顧客一覧の活用を絡めて160文字以内。",
      "category": "空き枠埋め / 客単価UP / リピート改善 / 新規集客 のいずれか"
    }
  ]
}

【留意点】
- suggestions は最大3件。優先度の高い順。
- 休眠顧客が多いならDM配信での来店促進を提案。
- リピート率が低い(40%未満)なら来店後フォローや次回予約の声かけを提案。
- 新規顧客が少ないなら集客施策を提案。
- データが少ない(予約0件など)場合は、まず予約データを蓄積する運用を提案。
- 誇大な売上予測や根拠のない数字は禁止。KPIの実数値のみ参照。
- 専門用語を避け、個人サロンのオーナーにも分かる平易な日本語で。`;
}

// ========================================
// 2. AI 応答検証
// ========================================

export function validateConsResponse(response: string): ValidationResult {
  const errors: string[] = [];
  let parsed: Record<string, unknown>;

  try {
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[1]);
    } else {
      parsed = JSON.parse(response);
    }
  } catch {
    return { valid: false, errors: ['JSON parsing failed'] };
  }

  if (typeof parsed.narrative !== 'string') {
    errors.push('Missing or invalid field: narrative');
  }
  if (!Array.isArray(parsed.suggestions)) {
    errors.push('Missing or invalid field: suggestions');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // クリーニング(型変換 + 文字数制限 + 最大3件)
  const rawSuggestions = Array.isArray(parsed.suggestions)
    ? parsed.suggestions
    : [];
  const cleanedSuggestions: ConsSuggestion[] = rawSuggestions
    .slice(0, 3)
    .map((s: unknown) => {
      const obj = (s && typeof s === 'object' ? s : {}) as Record<
        string,
        unknown
      >;
      return {
        title: String(obj.title ?? '').slice(0, 40),
        body: String(obj.body ?? '').slice(0, 160),
        category: String(obj.category ?? '提案').slice(0, 20),
      };
    })
    .filter((s) => s.title.length > 0 && s.body.length > 0);

  const cleaned: ConsAnalysis = {
    narrative: String(parsed.narrative ?? '').slice(0, 200),
    suggestions: cleanedSuggestions,
  };

  return { valid: true, errors: [], cleaned };
}

// ========================================
// 3. フォールバック応答
// ========================================

export function getConsFallback(kpis: ConsKpis): ConsAnalysis {
  const suggestions: ConsSuggestion[] = [];

  if (kpis.dormantCustomers > 0) {
    suggestions.push({
      title: '休眠顧客への来店促進DM',
      body: `60日以上ご来店のない顧客が${kpis.dormantCustomers}名います。DM配信から来店促進メッセージを送ると再来店が見込めます。`,
      category: 'リピート改善',
    });
  }
  if (kpis.totalCustomers > 0 && kpis.repeatRate < 40) {
    suggestions.push({
      title: 'リピート率の改善',
      body: `リピート率が${kpis.repeatRate.toFixed(1)}%です。来店後フォローや次回予約の声かけで改善余地があります。`,
      category: 'リピート改善',
    });
  }
  if (suggestions.length === 0) {
    suggestions.push({
      title: 'データ蓄積を継続',
      body: '予約・顧客データを蓄積していくことで、より精度の高い経営アドバイスが可能になります。',
      category: '運用',
    });
  }

  return {
    narrative:
      'AI分析を一時的に取得できませんでした。下記はKPIに基づく基本的な着眼点です。実際の経営判断はオーナーの判断を優先してください。',
    suggestions: suggestions.slice(0, 3),
  };
}
