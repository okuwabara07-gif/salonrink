import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// 薬機法：禁止語リスト（「改善」を含む）
const BANNED = ["絶対", "No.1", "日本一", "治る", "最高", "保証", "効果", "確実", "改善"];

// 禁止語→安全語の置換マップ（サニタイズ）
const SANITIZE_MAP: Record<string, string> = {
  効果: "使用感",
  改善: "ケア",
  治る: "整える",
  保証: "推奨",
  確実: "期待",
  最高: "優れた",
  絶対: "ぜひ",
  日本一: "人気",
};

/**
 * 禁止語をサニタイズ（検出時は置換・リトライなし、即座に置換して返す）
 */
function sanitizeText(text: string): string {
  let result = text;
  for (const [banned, safe] of Object.entries(SANITIZE_MAP)) {
    // 全置換（大文字・小文字問わず）
    result = result.replace(new RegExp(banned, "g"), safe);
  }
  return result;
}

export async function POST(req: NextRequest) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ error: "no key" }, { status: 500 });

  const a = await req.json();

  // ヘアマイカルテ診断プロンプト（薬機法配慮）
  // 日本語悩みタグに合わせた診断出力
  const prompt = `あなたはヘアケア専門家です。以下の入力に基づき、髪の状態と今後のケアの方向を提案します。
入力: 悩み=${a.concerns?.join(", ") || ""} 髪質=${a.hairType || ""} なりたい印象=${a.desired || ""}

禁止語: ${BANNED.join("、")}。表現は「目安」「※イメージ」「個人差があります」で統一。
※本診断は医療行為ではなく、効果を保証するものではありません。

悩みタグの語彙: ダメージ|乾燥|広がり|白髪|うねり|褪色

JSON形式で以下のみ出力:
{
  "primaryConcern": "主な悩みタグ（ダメージ|乾燥|広がり|白髪|うねり|褪色 のいずれか1つ）",
  "concerns": ["該当する悩みタグ配列（1〜3個、語彙から選択）"],
  "summary": "診断結果の概要（50字程度、目安・イメージを含む）",
  "recommendation": "ケアの方向性（50字程度）",
  "homecare": "自宅ケアのポイント（50字程度）"
}`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  // 上流エラーをそのまま surface
  if (!r.ok) {
    const errData = await r.json();
    console.error("[diagnose] Anthropic API error:", errData);
    return NextResponse.json(
      { error: errData.error?.message || "Anthropic API error" },
      { status: r.status }
    );
  }

  const data = await r.json();

  // null guard: content がない場合
  if (!data.content || !Array.isArray(data.content)) {
    console.error("[diagnose] No content in response:", data);
    return NextResponse.json({ error: "no content from API" }, { status: 502 });
  }

  const text = data.content.map((c: any) => c.text || "").join("");

  if (!text) {
    return NextResponse.json({ error: "empty response text" }, { status: 502 });
  }

  // JSON 抽出（正規表現でJSONブロックを抽出）
  let result: any = null;
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      result = JSON.parse(match[0]);
    }
  } catch (e) {
    console.error("[diagnose] JSON parse error:", e, "text:", text);
    return NextResponse.json({ error: "parse fail" }, { status: 400 });
  }

  // null guard: result がない場合
  if (!result) {
    return NextResponse.json({ error: "no result" }, { status: 502 });
  }

  // Step 1: 禁止語をサニタイズ（置換）
  for (const field of ["summary", "recommendation", "homecare", "primaryConcern"]) {
    if (result[field] && typeof result[field] === "string") {
      result[field] = sanitizeText(result[field]);
    }
  }

  // concerns 配列もサニタイズ
  if (Array.isArray(result.concerns)) {
    result.concerns = result.concerns.map((concern: string) =>
      typeof concern === "string" ? sanitizeText(concern) : concern
    );
  }

  // Step 2: サニタイズ後の最終チェック（マップ漏れ・新規禁止語の安全網）
  for (const field of ["summary", "recommendation", "homecare", "primaryConcern"]) {
    if (result[field]) {
      for (const word of BANNED) {
        if (result[field].includes(word)) {
          console.warn(`[diagnose] 禁止語残存（サニタイズ失敗）: ${word} in ${field}`);
          return NextResponse.json(
            { error: `禁止語検出: ${word}` },
            { status: 400 }
          );
        }
      }
    }
  }

  // concerns 配列の最終チェック
  if (Array.isArray(result.concerns)) {
    for (const concern of result.concerns) {
      for (const word of BANNED) {
        if (concern.includes(word)) {
          console.warn(`[diagnose] 禁止語残存（サニタイズ失敗）: ${word} in concerns`);
          return NextResponse.json(
            { error: `禁止語検出: ${word}` },
            { status: 400 }
          );
        }
      }
    }
  }

  return NextResponse.json(result);
}
