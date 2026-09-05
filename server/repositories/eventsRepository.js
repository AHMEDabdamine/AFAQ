import { supabaseAdmin } from '../db/client.js'

export async function searchEvents(query) {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('is_published', true)
    .or(`title_en.ilike.%${query}%,title_ar.ilike.%${query}%,title_fr.ilike.%${query}%,description_en.ilike.%${query}%,description_ar.ilike.%${query}%,description_fr.ilike.%${query}%`)
    .order('date', { ascending: true })
    .limit(10)

  if (error) {
    console.error('searchEvents error:', error)
    return []
  }
  return data || []
}

export async function getUpcomingEvents(limit = 5) {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('is_published', true)
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('getUpcomingEvents error:', error)
    return []
  }
  return data || []
}

export async function getAllPublishedEvents() {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('is_published', true)
    .order('date', { ascending: true })
    .limit(10)

  if (error) {
    console.error('getAllPublishedEvents error:', error)
    return []
  }
  return data || []
}
