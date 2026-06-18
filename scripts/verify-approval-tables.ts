/**
 * verify-approval-tables.ts
 * Supabase tables existence check
 *
 * Usage: npx ts-node scripts/verify-approval-tables.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase env vars')
  process.exit(1)
}

console.log(`✓ Supabase URL: ${supabaseUrl}`)

const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  try {
    console.log('\n📊 Checking approval funnel tables...\n')

    const expectedTables = [
      'funnel_leads',
      'funnel_lead_events',
      'carte',
      'approval_queue',
      'nurture_queue',
      'sns_queue',
    ]

    // Query information_schema to get table list
    const { data, error } = await admin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')

    if (error) {
      // Alternative: try to query each table
      console.log('Using direct table queries...\n')

      for (const tableName of expectedTables) {
        const { error: tableError } = await admin
          .from(tableName)
          .select('*', { count: 'exact', head: true })

        if (tableError) {
          console.log(`❌ ${tableName}: NOT FOUND`)
        } else {
          console.log(`✅ ${tableName}: EXISTS`)
        }
      }
      console.log('')
      return
    }

    const tables = data?.map((t: any) => t.table_name) || []

    console.log(`Found ${tables.length} tables in public schema:\n`)

    for (const tableName of expectedTables) {
      if (tables.includes(tableName)) {
        console.log(`✅ ${tableName}`)
      } else {
        console.log(`❌ ${tableName}: MISSING`)
      }
    }

    const missingTables = expectedTables.filter((t) => !tables.includes(t))

    if (missingTables.length === 0) {
      console.log('\n✅ All approval tables created successfully!')
    } else {
      console.log(`\n⚠️  Missing tables: ${missingTables.join(', ')}`)
      console.log(
        'Run: supabase migration up --linked'
      )
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()
