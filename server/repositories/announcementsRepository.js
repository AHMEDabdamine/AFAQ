import { supabaseAdmin } from '../db/client.js'

export async function searchAnnouncements(query) {
  const { data, error } = await supabaseAdmin
    .from('announcements')
    .select('*')
    .eq('is_published', true)
    .or(`title_en.ilike.%${query}%,title_ar.ilike.%${query}%,title_fr.ilike.%${query}%,content_en.ilike.%${query}%,content_ar.ilike.%${query}%,content_fr.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('searchAnnouncements error:', error)
    return []
  }
  return data || []
}

export async function getRecentAnnouncements(limit = 5) {
  const { data, error } = await supabaseAdmin
    .from('announcements')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getRecentAnnouncements error:', error)
    return []
  }
  return data || []
}
