import { supabaseAdmin } from '../db/client.js'

export async function searchFaqs(query) {
  const { data, error } = await supabaseAdmin
    .from('faq')
    .select('*')
    .eq('is_published', true)
    .or(`question_en.ilike.%${query}%,question_ar.ilike.%${query}%,question_fr.ilike.%${query}%,answer_en.ilike.%${query}%,answer_ar.ilike.%${query}%,answer_fr.ilike.%${query}%`)
    .order('sort_order', { ascending: true })
    .limit(10)

  if (error) {
    console.error('searchFaqs error:', error)
    return []
  }
  return data || []
}

export async function getAllFaqs() {
  const { data, error } = await supabaseAdmin
    .from('faq')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .limit(10)

  if (error) {
    console.error('getAllFaqs error:', error)
    return []
  }
  return data || []
}
