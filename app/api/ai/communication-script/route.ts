// 接客スクリプト生成 API
// POST /api/ai/communication-script
// 入力: { customer_id, salon_id, karte_id, planned_menu }
// 出力: AI生成のスクリプトを kartes.ai_communication_scripts に保存

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getCommunicationScriptPrompt } from '@/lib/ai/prompts';
import { callClaude, parseJsonResponse } from '@/lib/ai/claude-client';
import { checkAIUsageLimit, recordAIUsage } from '@/lib/ai/usage-tracker';
import type { Karte } from '@/lib/ai/prompts';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const { customer_id, salon_id, karte_id, planned_menu } = await request.json();

    // 入力検証
    if (!customer_id || !salon_id || !karte_id || !planned_menu) {
      return NextResponse.json(
        { error: 'Missing required fields: customer_id, salon_id, karte_id, planned_menu' },
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

    // Claude でスクリプトを生成
    const prompt = getCommunicationScriptPrompt(karte as Karte, customer.name, planned_menu, recipeData);
    const claudeResponse = await callClaude(prompt);
    const scriptData = parseJsonResponse(claudeResponse.content);

    // ai_communication_scripts を kartes テーブルに保存
    const { error: updateError } = await supabase
      .from('kartes')
      .update({
        ai_communication_scripts: scriptData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', karte_id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to save communication script' },
        { status: 500 }
      );
    }

    // 使用量記録(エラー出ても続行)
    await recordAIUsage(
      salon_id,
      'communication_script',
      claudeResponse.usage.input_tokens,
      claudeResponse.usage.output_tokens
    ).catch(err => console.error('Usage record failed:', err))

    return NextResponse.json(
      {
        success: true,
        script: scriptData,
        tokens: {
          input: claudeResponse.usage.input_tokens,
          output: claudeResponse.usage.output_tokens,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Communication script API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
