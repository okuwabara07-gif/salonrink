#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

// .env.local を読み込む
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  const lines = envContent.split('\n')
  lines.forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) return
    const key = trimmed.substring(0, eqIdx).trim()
    let value = trimmed.substring(eqIdx + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  })
}

/**
 * update-existing-eyecatch.ts
 * 既存ブログ記事3本の eyecatch を Unsplash から取得して更新
 *
 * 対象:
 * - salonrink-vs-repitte
 * - salonrink-vs-salobo
 * - hotpepper-vs-saas
 *
 * 実行: npx tsx scripts/update-existing-eyecatch.ts
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { getEyecatchUrl } from '@/lib/blog/eyecatch'

const TARGET_ARTICLES = [
  'salonrink-vs-repitte',
  'salonrink-vs-salobo',
  'hotpepper-vs-saas',
]

async function main() {
  console.log('[update-existing-eyecatch] Starting...')

  const supabase = createAdminClient()

  for (const slug of TARGET_ARTICLES) {
    console.log(`\n[update-existing-eyecatch] Processing: ${slug}`)

    // ステップ1: 既存記事を取得
    const { data: articles, error: selectError } = await supabase
      .from('blog_articles')
      .select('*')
      .eq('slug', slug)
      .single()

    if (selectError || !articles) {
      console.error(`[update-existing-eyecatch] Failed to fetch ${slug}: ${selectError?.message}`)
      continue
    }

    console.log(`[update-existing-eyecatch] Found: ${articles.title}`)

    // ステップ2: Pollinations.ai で画像生成
    const imageUrl = getEyecatchUrl({
      title: articles.title,
      cluster: articles.cluster,
      id: slug,
    })
    console.log(`[update-existing-eyecatch] Using image: ${imageUrl}`)

    // ステップ3: DB 更新
    const { error: updateError } = await supabase
      .from('blog_articles')
      .update({ image_url: imageUrl })
      .eq('slug', slug)

    if (updateError) {
      console.error(`[update-existing-eyecatch] Failed to update ${slug}: ${updateError.message}`)
      continue
    }

    console.log(`[update-existing-eyecatch] Updated: ${slug}`)
  }

  console.log('\n[update-existing-eyecatch] Complete')
  process.exit(0)
}

main().catch((err) => {
  console.error('[update-existing-eyecatch] Fatal error:', err)
  process.exit(1)
})
