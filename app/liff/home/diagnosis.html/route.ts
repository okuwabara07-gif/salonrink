// エンドポイント差し替え後の互換ルート。
// LIFF深リンク liff.line.me/{id}/diagnosis.html は「エンドポイントURL + /diagnosis.html」に解決されるため、
// endpoint=/liff/home に切り替えると配布済みFlexボタンがここ(/liff/home/diagnosis.html)へ着地する。
// クエリ(liff.state等)を保持したまま新診断へ308リダイレクトする。
import { NextRequest, NextResponse } from 'next/server';

export function GET(req: NextRequest) {
  const url = new URL('/liff/diagnosis', req.url);
  req.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));
  return NextResponse.redirect(url, 308);
}
