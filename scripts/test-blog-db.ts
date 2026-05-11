import fs from 'fs'
import path from 'path'
import { getAllBlogPostsFromDb, getBlogPostFromDb } from '../lib/blog-db'

// Load .env.local
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
    // Remove surrounding quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  })
}

async function main() {
  console.log('=== getAllBlogPostsFromDb ===')
  const all = await getAllBlogPostsFromDb()
  console.log('Count:', all.length)
  all.forEach(a => console.log('-', a.slug, '| image_url:', a.image_url))

  console.log('\n=== getBlogPostFromDb(salonrink-vs-repitte) ===')
  const one = await getBlogPostFromDb('salonrink-vs-repitte')
  console.log(JSON.stringify(one, null, 2))
}

main().catch(console.error)
