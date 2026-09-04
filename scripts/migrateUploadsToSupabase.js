import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const uploadDir = path.resolve(rootDir, 'upload')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const BUCKET = 'uploads'

const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
}

async function migrate() {
  console.log('Starting migration to Supabase Storage...')

  // 1. Ensure bucket exists
  try {
    const { data: buckets } = await supabase.storage.listBuckets()
    if (!buckets?.some(b => b.name === BUCKET)) {
      console.log(`Creating bucket '${BUCKET}'...`)
      const { error } = await supabase.storage.createBucket(BUCKET, { public: true })
      if (error) console.warn('Bucket create warning:', error.message)
    }
  } catch (err) {
    console.warn('Bucket listing warning:', err.message)
  }

  if (!fs.existsSync(uploadDir)) {
    console.log('No local upload directory found.')
    return
  }

  const files = fs.readdirSync(uploadDir).filter(f => !f.startsWith('.'))
  console.log(`Found ${files.length} local files in upload/`)

  const urlMap = new Map() // '/uploads/name' -> 'https://.../name'

  for (const file of files) {
    const filePath = path.join(uploadDir, file)
    const ext = path.extname(file).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    const buffer = fs.readFileSync(filePath)
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(file, buffer, { contentType, upsert: true })

    if (uploadError) {
      console.error(`Failed to upload ${file}:`, uploadError.message)
      continue
    }

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(file)
    const publicUrl = publicData.publicUrl
    urlMap.set(`/uploads/${file}`, publicUrl)
    console.log(`Uploaded: ${file} -> ${publicUrl}`)
  }

  console.log('\nUpdating database records...')

  // Update tables referencing /uploads/
  const tablesToUpdate = [
    { table: 'events', column: 'poster_url' },
    { table: 'projects', column: 'thumbnail_url' },
    { table: 'project_images', column: 'url' },
    { table: 'gallery_albums', column: 'cover_url' },
    { table: 'gallery_images', column: 'url' },
    { table: 'admin_users', column: 'avatar_url' },
    { table: 'page_content', column: 'image_url' },
  ]

  for (const { table, column } of tablesToUpdate) {
    try {
      const { data: rows, error: readErr } = await supabase
        .from(table)
        .select(`id, ${column}`)
        .not(column, 'is', null)

      if (readErr) {
        console.warn(`Could not read table ${table}:`, readErr.message)
        continue
      }

      console.log(`Checking '${table}' (${rows?.length || 0} rows)...`)
      let updatedCount = 0
      for (const row of rows || []) {
        const currentUrl = row[column]
        if (!currentUrl) continue

        // If local file was uploaded
        for (const [localPath, cloudUrl] of urlMap.entries()) {
          const filename = path.basename(localPath)
          if (
            currentUrl === localPath ||
            currentUrl.endsWith(localPath) ||
            currentUrl.includes(filename)
          ) {
            if (currentUrl !== cloudUrl) {
              const { error: updateErr } = await supabase
                .from(table)
                .update({ [column]: cloudUrl })
                .eq('id', row.id)

              if (updateErr) {
                console.error(`Error updating ${table} #${row.id}:`, updateErr.message)
              } else {
                console.log(`  Updated ${table} #${row.id}: ${currentUrl} -> ${cloudUrl}`)
                updatedCount++
              }
            }
          }
        }
      }
      console.log(`Table '${table}': updated ${updatedCount} rows.`)
    } catch (e) {
      console.warn(`Table '${table}' update skipped:`, e.message)
    }
  }

  console.log('\nMigration to Supabase Storage complete!')
}

migrate().catch(console.error)
