// instagram-doctor.mjs  (v2)
// Instagram Graph API 自動投稿の「準備状況」を機械的に判定する読み取り専用スクリプト。
// 投稿はしません。トークンに紐づくIGアカウント・ID・権限・期限を一覧表示するだけ。
//
// v2: .env.local / .env から自動でトークンを読み込みます（対話入力 read -rs は不要）。
//     トークンの「値」は一切表示しません。
//
// 使い方（リポジトリのルートで）:
//   node scripts/instagram-doctor.mjs

import fs from "node:fs";
import path from "node:path";

const loadedKeys = new Set();
function loadEnvFile(file) {
  try {
    const txt = fs.readFileSync(file, "utf8");
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let [, k, v] = m;
      v = v.trim().replace(/^["']|["']$/g, "");
      if (process.env[k] === undefined) process.env[k] = v;
      loadedKeys.add(k);
    }
    return true;
  } catch {
    return false;
  }
}
const cwd = process.cwd();
const loaded = [".env.local", ".env"].filter((f) => loadEnvFile(path.join(cwd, f)));
if (loaded.length) console.log(`(${loaded.join(", ")} を読み込みました)\n`);

const CANDIDATES = [
  "IG_TOKEN", "META_TOKEN", "INSTAGRAM_TOKEN", "FB_PAGE_TOKEN",
  "META_ACCESS_TOKEN", "IG_ACCESS_TOKEN", "PAGE_ACCESS_TOKEN",
];
let TOKEN = null;
let usedKey = null;
for (const k of CANDIDATES) {
  if (process.env[k]) { TOKEN = process.env[k]; usedKey = k; break; }
}

if (!TOKEN) {
  console.error("❌ 既知のトークン変数が見つかりませんでした。");
  const tokenish = [...loadedKeys].filter((k) => /TOKEN|ACCESS|SECRET|FB|META|IG|INSTAGRAM/i.test(k));
  if (tokenish.length) {
    console.error("\n.env.local にあった“それっぽい”変数名（値は出しません）:");
    console.error("  " + tokenish.join("\n  "));
    console.error("\nこの中にInstagram/Facebookの長期トークンがあれば、その変数名を教えてください。");
  } else {
    console.error(".env.local にトークンらしき変数が見当たりません。既存ポスターがトークンをどこから読んでいるか確認が必要です。");
  }
  process.exit(1);
}
console.log(`(トークン変数: ${usedKey} を使用)\n`);

const GRAPH = "https://graph.facebook.com/v21.0";
const getJSON = async (url) => {
  const r = await fetch(url);
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data };
};
const q = (params) => new URLSearchParams({ ...params, access_token: TOKEN }).toString();

console.log("=== Instagram Graph API 診断（読み取り専用・投稿しません）===\n");

{
  const { ok, status, data } = await getJSON(`${GRAPH}/me?${q({ fields: "id,name" })}`);
  if (!ok) {
    console.error(`❌ トークンが無効か期限切れの可能性 (status ${status}): ${data.error?.message || JSON.stringify(data)}`);
    process.exit(1);
  }
  console.log(`✅ トークン有効。所有者: ${data.name}  (id: ${data.id})`);
}

{
  const { ok, data } = await getJSON(
    `https://graph.facebook.com/debug_token?${new URLSearchParams({ input_token: TOKEN, access_token: TOKEN })}`
  );
  const d = data.data;
  if (ok && d) {
    const exp =
      d.expires_at === 0 ? "無期限（長期トークン）"
      : d.expires_at ? new Date(d.expires_at * 1000).toISOString()
      : "不明";
    console.log(`   有効期限: ${exp}`);
    if (Array.isArray(d.scopes)) {
      console.log(`   権限スコープ: ${d.scopes.join(", ")}`);
      console.log(`   投稿権限(instagram_content_publish): ${d.scopes.includes("instagram_content_publish") ? "✅ あり" : "⚠️ 見当たらない"}`);
    }
  } else {
    console.log("   (debug_token は取得不可。下のアカウント一覧が出れば実質OK)");
  }
}

console.log("\n--- このトークンで投稿できるアカウント ---");
{
  const { ok, status, data } = await getJSON(
    `${GRAPH}/me/accounts?${q({ fields: "name,id,instagram_business_account{id,username}" })}`
  );
  if (!ok) {
    console.error(`❌ ページ一覧の取得に失敗 (status ${status}): ${data.error?.message || JSON.stringify(data)}`);
    process.exit(1);
  }
  const pages = data.data || [];
  if (!pages.length) console.log("⚠️ このトークンに紐づくFacebookページが見つかりません（IG投稿には連携が必要）。");
  for (const p of pages) {
    const ig = p.instagram_business_account;
    if (ig) console.log(`✅ ページ「${p.name}」 → IG: @${ig.username}  (IG_USER_ID: ${ig.id})`);
    else console.log(`・ ページ「${p.name}」 → IGビジネスアカウント未連携`);
  }
}

console.log(
  "\n=== 診断おわり ===\n上の ✅ 行（@ユーザー名 と IG_USER_ID）をそのままコピペで共有してください。\n（IG_USER_ID は秘密ではないのでOK。トークンの値は絶対に貼らないで）"
);
