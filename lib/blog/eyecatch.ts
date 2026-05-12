// クラスタ別プロンプト
const CLUSTER_PROMPTS: Record<string, string> = {
  '競合比較': 'professional hair salon business, modern technology, comparison',
  'ノウハウ': 'professional hairstylist working in salon, beauty industry, expertise',
  'トレンド': 'modern beauty salon trends, future of beauty industry, professional',
}

/**
 * Pollinations.ai で記事のアイキャッチ画像URLを生成
 * 認証不要、無料、AI生成
 */
export function getEyecatchUrl(meta: {
  title: string
  cluster: string
  id: string
}): string {
  const basePrompt = CLUSTER_PROMPTS[meta.cluster] || 'professional beauty salon, modern, elegant'

  const prompt = `${basePrompt}, photorealistic, high quality, no text, no people faces`

  const encodedPrompt = encodeURIComponent(prompt)

  // seed を slug にすることで、記事ごとに一意な画像が生成される
  const seed = meta.id

  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=450&seed=${seed}&nologo=true`
}
