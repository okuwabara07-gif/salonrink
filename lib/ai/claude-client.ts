// Claude Haiku クライアント
// Phase 1: AIカルテ API スケルトン
// Anthropic SDK を使用した Claude Haiku 4-5 の呼び出し

import Anthropic from '@anthropic-ai/sdk';

// Anthropic クライアントの初期化
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ClaudeResponse {
  content: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  model: string;
}

/**
 * Claude Haiku 4-5 を呼び出してプロンプトに対する応答を取得
 * @param prompt ユーザープロンプト
 * @returns JSON形式の応答
 */
export async function callClaude(prompt: string): Promise<ClaudeResponse> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // テキストコンテンツの抽出
    const textContent = message.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response');
    }

    return {
      content: textContent.text,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
      },
      model: message.model,
    };
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      throw new Error(`Anthropic API Error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Claude の JSON レスポンスをパース
 * @param responseText Claude からのテキストレスポンス
 * @returns パースされたJSON オブジェクト
 */
export function parseJsonResponse(responseText: string): Record<string, any> {
  // JSON ブロックを抽出（```json ... ``` の形式に対応）
  const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1]);
  }

  // JSON ブロックがない場合はそのまま parse を試みる
  try {
    return JSON.parse(responseText);
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${error}`);
  }
}
