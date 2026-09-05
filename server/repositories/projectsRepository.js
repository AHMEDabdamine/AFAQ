import { supabaseAdmin } from '../db/client.js'

export async function searchProjects(query) {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('is_published', true)
    .or(`title_en.ilike.%${query}%,title_ar.ilike.%${query}%,title_fr.ilike.%${query}%,description_en.ilike.%${query}%,description_ar.ilike.%${query}%,description_fr.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('searchProjects error:', error)
    return []
  }
  return data || []
}

export async function getAllPublishedProjects() {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('getAllPublishedProjects error:', error)
    return []
  }
  return data || []
}
