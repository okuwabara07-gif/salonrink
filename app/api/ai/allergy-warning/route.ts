// アレルギー警告生成 API
// POST /api/ai/allergy-warning
// 入力: { customer_id, salon_id, karte_id }
// 出力: AI生成の警告を kartes.ai_warnings に保存

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getAllergyWarningPrompt } from '@/lib/ai/prompts';
import { callClaude, parseJsonResponse } from '@/lib/ai/claude-client';
import type { Karte } from '@/lib/ai/prompts';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const { customer_id, salon_id, karte_id } = await request.json();

    // 入力検証
    if (!customer_id || !salon_id || !karte_id) {
      return NextResponse.json(
        { error: 'Missing required fields: customer_id, salon_id, karte_id' },
        { status: 400 }
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

    // Claude で警告を生成
    const prompt = getAllergyWarningPrompt(karte as Karte, customer.name, recipeData);
    const claudeResponse = await callClaude(prompt);
    const warningData = parseJsonResponse(claudeResponse.content);

    // ai_warnings を kartes テーブルに保存
    const { error: updateError } = await supabase
      .from('kartes')
      .update({
        ai_warnings: warningData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', karte_id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to save allergy warnings' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        warnings: warningData,
        tokens: {
          input: claudeResponse.usage.input_tokens,
          output: claudeResponse.usage.output_tokens,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Allergy warning API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
