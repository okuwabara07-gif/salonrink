#!/usr/bin/env node
/**
 * キレイ鶴見店を開発者権限で無料登録するスクリプト
 * 使用方法: node scripts/register-kirei-tsurumi.js
 */

const fs = require('fs');
const path = require('path');

// .env.localを手動で読み込み
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

Object.assign(process.env, envVars);

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SALON_DATA = {
  name: 'キレイ鶴見店',
  email: 'kirei.tsurumi2021@gmail.com',
  owner_name: '代表社員',
  phone: '09032207783',
  hotpepper_url: 'https://beauty.hotpepper.jp/slnH000501100/',
  plan: 'basic',
  status: 'active',
  is_active: true,
  trial_ends_at: '2026-05-20T23:59:59+00:00',
};

async function registerSalon() {
  try {
    console.log('🔧 キレイ鶴見店を登録中...\n');

    // 1. Supabase Authにユーザーを作成（パスワード不要、メールベース認証）
    console.log('ステップ1: Supabase Auth ユーザーを作成');
    const { data: { user }, error: signUpError } = await supabase.auth.admin.createUser({
      email: SALON_DATA.email,
      email_confirm: true, // メール確認を自動完了
    });

    if (signUpError) {
      // ユーザーが既に存在する場合はスキップ
      if (signUpError.message.includes('User already exists')) {
        console.log('ℹ️  ユーザーは既に存在します。スキップします。');
      } else {
        throw signUpError;
      }
    } else {
      console.log(`✓ ユーザー作成完了: ${user?.id}`);
    }

    // 2. salonsテーブルにレコードを挿入
    console.log('\nステップ2: salons テーブルにレコードを挿入');
    const { data: existingSalon, error: checkError } = await supabase
      .from('salons')
      .select('id')
      .eq('email', SALON_DATA.email)
      .maybeSingle();

    if (existingSalon) {
      console.log('ℹ️  サロンレコードは既に存在します。更新をスキップします。');
    } else {
      // 新規挿入
      const salonData = {
        ...SALON_DATA,
        owner_user_id: user?.id || null, // ユーザーIDを関連付け
      };

      const { data: salon, error: insertError } = await supabase
        .from('salons')
        .insert([salonData])
        .select();

      if (insertError) throw insertError;
      console.log(`✓ サロン登録完了`);
      console.log(`  ID: ${salon[0].id}`);
      console.log(`  名前: ${salon[0].name}`);
      console.log(`  プラン: ${salon[0].plan}`);
      console.log(`  トライアル期限: ${salon[0].trial_ends_at}`);
    }

    // 3. ログインリンク送信情報
    console.log('\n' + '='.repeat(60));
    console.log('📧 ログイン方法');
    console.log('='.repeat(60));
    console.log(`
サロン関係者は以下のリンクからログインしてください：

ログインURL: https://salonrink.com/login

メールアドレス: ${SALON_DATA.email}

手順:
1. ログインページにアクセス
2. メールアドレス「${SALON_DATA.email}」を入力
3. 「ログインリンクを送る」をクリック
4. メールに届いたリンクをクリック
5. ダッシュボードが表示されます

マジックリンク認証により、パスワード入力なしでログイン可能です。
    `);

    console.log('='.repeat(60));
    console.log('✅ セットアップ完了！');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ エラーが発生しました:');
    console.error(error.message);
    process.exit(1);
  }
}

// 実行
registerSalon();
