// エンドポイント差し替え後の互換ルート（詳細は diagnosis.html/route.ts のコメント参照）。
import { NextRequest, NextResponse } from 'next/server';

export function GET(req: NextRequest) {
  const url = new URL('/liff/store', req.url);
  req.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));
  return NextResponse.redirect(url, 308);
}
