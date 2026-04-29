// 次回提案生成 API
// POST /api/ai/next-recommendation
// 入力: { customer_id, salon_id, karte_id, current_menu }
// 出力: AI生成の提案を kartes.ai_next_recommendation に保存

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getNextRecommendationPrompt } from '@/lib/ai/prompts';
import { callClaude, parseJsonResponse } from '@/lib/ai/claude-client';
import { checkAIUsageLimit, recordAIUsage } from '@/lib/ai/usage-tracker';
import type { Karte } from '@/lib/ai/prompts';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const { customer_id, salon_id, karte_id, current_menu } = await request.json();

    // 入力検証
    if (!customer_id || !salon_id || !karte_id || !current_menu) {
      return NextResponse.json(
        { error: 'Missing required fields: customer_id, salon_id, karte_id, current_menu' },
        { status: 400 }
      );
    }

    // AI 使用量チェック
    const usageStatus = await checkAIUsageLimit(salon_id)
    if (!usageStatus.allowed) {
      return NextResponse.json(
        {
          error: 'AI usage limit exceeded',
          used: usageStatus.used,
          limit: usageStatus.limit,
          plan: usageStatus.plan,
        },
        { status: 429 }
      );
    }

    // kartes テーブルから顧客カルテを取得
    const { data: karte, error: karteError } = await supabase
      .from('kartes')
      .select('*')
      .eq('id', karte_id)
      .eq('salon_id', salon_id)
      .eq('customer_id', customer_id)
      .single();

    if (karteError || !karte) {
      return NextResponse.json(
        { error: 'Karte not found or access denied' },
        { status: 404 }
      );
    }

    // customers テーブルから顧客名を取得
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('name')
      .eq('id', customer_id)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // karte_recipes から詳細情報を取得（最新1件）
    const { data: recipes, error: recipesError } = await supabase
      .from('karte_recipes')
      .select('recipe_data')
      .eq('salon_id', salon_id)
      .eq('karte_id', karte_id)
      .order('created_at', { ascending: false })
      .limit(1);

    const recipeData = recipes && recipes.length > 0 ? recipes[0].recipe_data : undefined;

    // Claude で提案を生成
    const prompt = getNextRecommendationPrompt(karte as Karte, customer.name, current_menu, recipeData);
    const claudeResponse = await callClaude(prompt);
    const recommendationData = parseJsonResponse(claudeResponse.content);

    // ai_next_recommendation を kartes テーブルに保存
    const { error: updateError } = await supabase
      .from('kartes')
      .update({
        ai_next_recommendation: recommendationData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', karte_id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to save next recommendation' },
        { status: 500 }
      );
    }

    // 使用量記録(エラー出ても続行)
    await recordAIUsage(
      salon_id,
      'next_recommendation',
      claudeResponse.usage.input_tokens,
      claudeResponse.usage.output_tokens
    ).catch(err => console.error('Usage record failed:', err))

    return NextResponse.json(
      {
        success: true,
        recommendation: recommendationData,
        tokens: {
          input: claudeResponse.usage.input_tokens,
          output: claudeResponse.usage.output_tokens,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Next recommendation API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
