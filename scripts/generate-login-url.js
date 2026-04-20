#!/usr/bin/env node
/**
 * kirei.tsurumi2021@gmail.com のセッショントークンを生成し
 * ログインURLを作成するスクリプト
 * 使用方法: node scripts/generate-login-url.js
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    let value = valueParts.join('=').trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    envVars[key.trim()] = value;
  }
});

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

const TARGET_EMAIL = 'kirei.tsurumi2021@gmail.com';
const SITE_URL = envVars.NEXT_PUBLIC_SITE_URL || 'https://salonrink.com';
const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;

async function generateLoginUrl() {
  try {
    // ユーザーを取得
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ ユーザー一覧取得エラー:', listError.message);
      process.exit(1);
    }

    const user = users.find(u => u.email === TARGET_EMAIL);
    if (!user) {
      console.error(`❌ ユーザーが見つかりません: ${TARGET_EMAIL}`);
      process.exit(1);
    }

    // リカバリートークンを生成（パスワードリセット用）
    const { data, error: tokenError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: TARGET_EMAIL,
      options: {
        redirectTo: `${SITE_URL}/auth/callback`,
      }
    });

    if (tokenError) {
      console.error('❌ トークン生成エラー:', tokenError.message);
      process.exit(1);
    }

    if (!data || !data.properties || !data.properties.action_link) {
      console.error('❌ アクションリンクが生成されませんでした');
      process.exit(1);
    }

    // ログインURLを修正（Supabase URLからパラメータを抽出）
    const actionLink = data.properties.action_link;
    const url = new URL(actionLink);
    const token = url.searchParams.get('token');
    const type = url.searchParams.get('type');

    // salonrink.comのログインURLを構築
    const loginUrl = `${SITE_URL}/auth/callback?token=${token}&type=${type}`;
    console.log(loginUrl);

  } catch (error) {
    console.error('❌ 実行エラー:', error.message);
    process.exit(1);
  }
}

generateLoginUrl();
