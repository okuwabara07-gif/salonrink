import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import crypto from 'crypto';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  const { error: dbErr } = await supabase.from('delete_requests').insert({
    user_id: user.id,
    email: user.email,
    token,
    expires_at: expiresAt,
  });
  if (dbErr) {
    console.error('delete_requests insert error:', dbErr);
    return NextResponse.json({ error: 'db' }, { status: 500 });
  }

  const confirmUrl = `https://salonrink.com/account/delete-confirm?token=${token}`;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    await resend.emails.send({
      from: 'SalonRink <noreply@salonrink.com>',
      to: user.email,
      subject: '【SalonRink】アカウント削除リクエストの確認',
      html: `
        <div style="font-family: -apple-system, 'Hiragino Sans', sans-serif; max-width: 560px; margin: 0 auto; color: #2a1f15;">
          <h2 style="color: #1a1a1a; font-size: 20px;">アカウント削除の確認</h2>
          <p>SalonRink アカウントの削除リクエストを受け付けました。</p>
          <p>以下のボタンをクリックして、48時間以内に削除を承認してください。承認後、すべてのデータが完全に削除されます(復元不可)。</p>
          <p style="margin: 32px 0;">
            <a href="${confirmUrl}"
               style="display: inline-block; background: #c4392e; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
              削除を承認する
            </a>
          </p>
          <p style="font-size: 12px; color: #666;">
            このメールに心当たりがない場合は破棄してください。リンクは48時間で無効になります。
          </p>
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 11px; color: #999;">SalonRink Concierge / AOKAE合同会社</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('resend error:', err);
    return NextResponse.json({ error: 'mail' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
